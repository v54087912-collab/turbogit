// Cloudflare Pages Function: /api/telegram/sign-in

export async function onRequestPost(context: { request: Request }): Promise<Response> {
  try {
    const { apiId, apiHash, phone, phoneCodeHash, phoneCode, sessionString } =
      (await context.request.json()) as {
        apiId?: number;
        apiHash?: string;
        phone?: string;
        phoneCodeHash?: string;
        phoneCode?: string;
        sessionString?: string;
      };

    if (!apiId || !apiHash || !phone || !phoneCodeHash || !phoneCode) {
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

    try {
      await client.invoke(
        new Api.auth.SignIn({
          phoneNumber: phone,
          phoneCodeHash,
          phoneCode,
        } as never)
      );

      const savedSession = client.session.save() as unknown as string;

      return new Response(
        JSON.stringify({
          success: true,
          sessionString: savedSession,
          twoFactorRequired: false,
        }),
        {
          headers: { "Content-Type": "application/json" },
        }
      );
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      if (errorMessage.includes("SESSION_PASSWORD_NEEDED")) {
        return new Response(
          JSON.stringify({
            success: false,
            twoFactorRequired: true,
          }),
          {
            headers: { "Content-Type": "application/json" },
          }
        );
      }
      throw err;
    }
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Failed to sign in",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
