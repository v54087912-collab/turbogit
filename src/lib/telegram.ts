// TurboGit Web Telegram MTProto Client
// Dual-mode: Supports Cloudflare Pages Functions (/api/telegram/*) with seamless client-side WebSocket fallback (useWSS: true)

async function getClientTelegram() {
  const { TelegramClient } = await import("telegram");
  const { StringSession } = await import("telegram/sessions");
  const telegram = await import("telegram");
  return { TelegramClient, StringSession, Api: telegram.Api };
}

export async function sendCode(
  apiId: number,
  apiHash: string,
  phone: string
): Promise<{ sessionId: string; phoneCodeHash: string }> {
  try {
    const res = await fetch("/api/telegram/send-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ apiId, apiHash, phone }),
    });

    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Fall back to direct client execution
  }

  const { TelegramClient, StringSession, Api } = await getClientTelegram();
  const session = new StringSession("");
  const client = new TelegramClient(session, apiId, apiHash, {
    connectionRetries: 5,
    useWSS: true,
  });

  await client.connect();

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

  return {
    sessionId,
    phoneCodeHash: sentCode.phoneCodeHash as string,
  };
}

export async function signIn(
  apiId: number,
  apiHash: string,
  phone: string,
  phoneCodeHash: string,
  phoneCode: string,
  sessionString?: string
): Promise<{ success: boolean; sessionString?: string; twoFactorRequired: boolean }> {
  try {
    const res = await fetch("/api/telegram/sign-in", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ apiId, apiHash, phone, phoneCodeHash, phoneCode, sessionString }),
    });

    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Fall back to direct client execution
  }

  const { TelegramClient, StringSession, Api } = await getClientTelegram();
  const session = new StringSession(sessionString || "");
  const client = new TelegramClient(session, apiId, apiHash, {
    connectionRetries: 5,
    useWSS: true,
  });

  await client.connect();

  try {
    await client.invoke(
      new Api.auth.SignIn({
        phoneNumber: phone,
        phoneCodeHash,
        phoneCode,
      } as never)
    );

    const savedSession = client.session.save() as unknown as string;
    return {
      success: true,
      sessionString: savedSession,
      twoFactorRequired: false,
    };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    if (errorMessage.includes("SESSION_PASSWORD_NEEDED")) {
      return {
        success: false,
        twoFactorRequired: true,
      };
    }
    throw err;
  }
}

export async function check2FA(
  apiId: number,
  apiHash: string,
  phone: string,
  phoneCodeHash: string,
  phoneCode: string,
  password: string,
  sessionString?: string
): Promise<{ success: boolean; sessionString: string }> {
  try {
    const res = await fetch("/api/telegram/check-2fa", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ apiId, apiHash, phone, phoneCodeHash, phoneCode, password, sessionString }),
    });

    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Fall back to direct client execution
  }

  const { TelegramClient, StringSession, Api } = await getClientTelegram();
  const session = new StringSession(sessionString || "");
  const client = new TelegramClient(session, apiId, apiHash, {
    connectionRetries: 5,
    useWSS: true,
  });

  await client.connect();

  await client.invoke(
    new Api.auth.SignIn({
      phoneNumber: phone,
      phoneCodeHash,
      phoneCode,
    } as never)
  );

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
  return {
    success: true,
    sessionString: savedSession,
  };
}

export async function testConnection(
  apiId: number,
  apiHash: string,
  sessionString: string
): Promise<boolean> {
  try {
    const res = await fetch("/api/telegram/connect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ apiId, apiHash, sessionString }),
    });

    if (res.ok) {
      const data = await res.json();
      return data.connected === true;
    }
  } catch {
    // Fall back to direct client execution
  }

  try {
    const { TelegramClient, StringSession } = await getClientTelegram();
    const session = new StringSession(sessionString);
    const client = new TelegramClient(session, apiId, apiHash, {
      connectionRetries: 5,
      useWSS: true,
    });

    await client.connect();
    return client.connected;
  } catch {
    return false;
  }
}
