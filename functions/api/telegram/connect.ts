// Cloudflare Pages Function: /api/telegram/connect

export async function onRequestPost(context: { request: Request }): Promise<Response> {
  try {
    const { apiId, apiHash, sessionString } = await context.request.json() as {
      apiId?: number;
      apiHash?: string;
      sessionString?: string;
    };

    if (!apiId || !apiHash || !sessionString) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { TelegramClient } = await import("telegram");
    const { StringSession } = await import("telegram/sessions");

    const session = new StringSession(sessionString);
    const client = new TelegramClient(session, apiId, apiHash, {
      connectionRetries: 5,
      useWSS: true,
    });

    await client.connect();
    const connected = client.connected;

    return new Response(JSON.stringify({ connected }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Failed to connect",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
