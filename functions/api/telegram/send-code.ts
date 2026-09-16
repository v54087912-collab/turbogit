// Cloudflare Pages Function: /api/telegram/send-code

export async function onRequestPost(context: { request: Request }): Promise<Response> {
  try {
    const { apiId, apiHash, phone } = await context.request.json() as {
      apiId?: number;
      apiHash?: string;
      phone?: string;
    };

    if (!apiId || !apiHash || !phone) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { TelegramClient } = await import("telegram");
    const { StringSession } = await import("telegram/sessions");
    const telegram = await import("telegram");

    const session = new StringSession("");
    const client = new TelegramClient(session, apiId, apiHash, {
      connectionRetries: 5,
      useWSS: true,
    });

    await client.connect();

    const Api = telegram.Api;

    const codeSettings = Object.create(Api.CodeSettings.prototype);
    const sendCodeParams = {
      apiId,
      apiHash,
      phoneNumber: phone,
      settings: codeSettings,
    };

    const sendCodeInstance = Object.create(Api.auth.SendCode.prototype);
    Object.assign(sendCodeInstance, sendCodeParams);
    const result = await client.invoke(sendCodeInstance);

    const sessionId = crypto.randomUUID();
    const sentCode = result as unknown as Record<string, unknown>;

    return new Response(
      JSON.stringify({
        sessionId,
        phoneCodeHash: sentCode.phoneCodeHash,
      }),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Failed to send code",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
