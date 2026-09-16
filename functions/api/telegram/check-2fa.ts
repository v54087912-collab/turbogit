// Cloudflare Pages Function: /api/telegram/check-2fa

export async function onRequestPost(context: { request: Request }): Promise<Response> {
  try {
    const {
      apiId,
      apiHash,
      phone,
      phoneCodeHash,
      phoneCode,
      password,
      sessionString,
    } = (await context.request.json()) as {
      apiId?: number;
      apiHash?: string;
      phone?: string;
      phoneCodeHash?: string;
      phoneCode?: string;
      password?: string;
      sessionString?: string;
    };

    if (
      !apiId ||
      !apiHash ||
      !phone ||
      !phoneCodeHash ||
      !phoneCode ||
      !password
    ) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { TelegramClient } = await import("telegram");
    const { StringSession } = await import("telegram/sessions");
    const telegram = await import("telegram");

    const session = new StringSession(sessionString || "");
    const client = new TelegramClient(session, apiId, apiHash, {
      connectionRetries: 5,
      useWSS: true,
    });

    await client.connect();

    const Api = telegram.Api;

    // First sign in with OTP
    await client.invoke(
      new Api.auth.SignIn({
        phoneNumber: phone,
        phoneCodeHash,
        phoneCode,
      } as never)
    );

    // Then check 2FA
    const passwordInfo = (await client.invoke(
      new Api.account.GetPassword()
    )) as unknown as Record<string, unknown>;

    const computeCheck = (
      passwordInfo as { computeCheck?: (pw: string) => Promise<unknown> }
    ).computeCheck;
    if (!computeCheck) {
      throw new Error("Could not compute 2FA check");
    }

    const checkPasswordResult = await client.invoke(
      new Api.auth.CheckPassword({
        password: await computeCheck(password),
      } as never)
    );

    const authResult = checkPasswordResult as unknown as Record<string, unknown>;
    if (!authResult.user) {
      throw new Error("2FA verification failed");
    }

    const savedSession = client.session.save() as unknown as string;

    return new Response(
      JSON.stringify({
        success: true,
        sessionString: savedSession,
      }),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Failed to verify 2FA",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
