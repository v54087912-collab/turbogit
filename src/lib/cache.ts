import { encrypt } from "./crypto";

const CACHE_TAG = "TURBOGIT_CACHE_V1";

export interface CachePayload {
  repos?: unknown[];
  workflows?: unknown[];
  fileTrees?: Record<string, unknown>;
  timestamp: number;
}

export async function pushToSavedMessages(
  data: CachePayload
): Promise<string> {
  const jsonData = JSON.stringify(data);
  const encryptedData = await encrypt(jsonData, "temp-key");
  return `${CACHE_TAG}\n${encryptedData}`;
}

export function parseCachePayload(message: string): CachePayload | null {
  if (!message.startsWith(CACHE_TAG)) return null;
  // In a real implementation, this would decrypt with the master password
  // For now, return null as decryption requires the master password
  return null;
}
