export async function sendCode(
  apiId: number,
  apiHash: string,
  phone: string
): Promise<{ sessionId: string; phoneCodeHash: string }> {
  const res = await fetch("/api/telegram/send-code", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ apiId, apiHash, phone }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to send code");
  return data;
}

export async function signIn(
  apiId: number,
  apiHash: string,
  phone: string,
  phoneCodeHash: string,
  phoneCode: string,
  sessionString?: string
): Promise<{ success: boolean; sessionString?: string; twoFactorRequired: boolean }> {
  const res = await fetch("/api/telegram/sign-in", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ apiId, apiHash, phone, phoneCodeHash, phoneCode, sessionString }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to sign in");
  return data;
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
  const res = await fetch("/api/telegram/check-2fa", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ apiId, apiHash, phone, phoneCodeHash, phoneCode, password, sessionString }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to verify 2FA");
  return data;
}

export async function testConnection(
  apiId: number,
  apiHash: string,
  sessionString: string
): Promise<boolean> {
  const res = await fetch("/api/telegram/connect", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ apiId, apiHash, sessionString }),
  });

  const data = await res.json();
  if (!res.ok) return false;
  return data.connected === true;
}
