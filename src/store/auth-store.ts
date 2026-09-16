import { create } from "zustand";
import {
  getEncryptedConfig,
  setEncryptedConfig,
  getMasterHash,
  setMasterHash,
  clearAll,
} from "@/lib/indexed-db";
import { encrypt, decrypt } from "@/lib/crypto";

interface AuthState {
  isUnlocked: boolean;
  hasMasterPassword: boolean;
  hasCredentials: boolean;
  hasPermanentSession: boolean;
  masterPassword: string | null;
  octokit: unknown;
  telegramClient: unknown;

  setMasterPassword: (password: string) => Promise<void>;
  unlock: (password: string) => Promise<boolean>;
  lock: () => void;
  saveGitHubToken: (token: string) => Promise<void>;
  saveTelegramApi: (apiId: number, apiHash: string) => Promise<void>;
  savePermanentSession: (sessionString: string) => Promise<void>;
  loadCredentials: () => Promise<void>;
  testConnections: () => Promise<{ github: boolean; telegram: boolean }>;
  resetAll: () => Promise<void>;
}

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + "turbogit-salt-v1");
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = new Uint8Array(hashBuffer);
  return Array.from(hashArray)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isUnlocked: false,
  hasMasterPassword: false,
  hasCredentials: false,
  hasPermanentSession: false,
  masterPassword: null,
  octokit: null,
  telegramClient: null,

  setMasterPassword: async (password: string) => {
    const hash = await hashPassword(password);
    await setMasterHash(hash);
    set({ hasMasterPassword: true });
  },

  unlock: async (password: string): Promise<boolean> => {
    const storedHash = await getMasterHash();
    if (!storedHash) return false;

    const inputHash = await hashPassword(password);
    if (inputHash !== storedHash) return false;

    set({ isUnlocked: true, masterPassword: password });
    await get().loadCredentials();
    return true;
  },

  lock: () => {
    set({
      isUnlocked: false,
      masterPassword: null,
      octokit: null,
      telegramClient: null,
    });
  },

  saveGitHubToken: async (token: string) => {
    const { masterPassword } = get();
    if (!masterPassword) throw new Error("Master password required");
    const encrypted = await encrypt(token, masterPassword);
    await setEncryptedConfig("github_token", encrypted);

    const { Octokit } = await import("octokit");
    const octokit = new Octokit({ auth: token });
    set({ octokit, hasCredentials: true });
  },

  saveTelegramApi: async (apiId: number, apiHash: string) => {
    const { masterPassword } = get();
    if (!masterPassword) throw new Error("Master password required");
    const encId = await encrypt(String(apiId), masterPassword);
    const encHash = await encrypt(apiHash, masterPassword);
    await setEncryptedConfig("tg_api_id", encId);
    await setEncryptedConfig("tg_api_hash", encHash);
  },

  savePermanentSession: async (sessionString: string) => {
    const { masterPassword } = get();
    if (!masterPassword) throw new Error("Master password required");
    const encrypted = await encrypt(sessionString, masterPassword);
    await setEncryptedConfig("tg_session", encrypted);
    set({ hasPermanentSession: true });
  },

  loadCredentials: async () => {
    const { masterPassword } = get();
    if (!masterPassword) return;

    try {
      const encToken = await getEncryptedConfig("github_token");
      const encSession = await getEncryptedConfig("tg_session");

      if (encToken) {
        const token = await decrypt(encToken, masterPassword);
        const { Octokit } = await import("octokit");
        const octokit = new Octokit({ auth: token });
        set({ octokit, hasCredentials: true });
      }

      if (encSession) {
        set({ hasPermanentSession: true });
      }
    } catch {
      set({ octokit: null });
    }
  },

  testConnections: async () => {
    const { octokit, masterPassword } = get();
    const result = { github: false, telegram: false };

    if (octokit) {
      try {
        const o = octokit as { rest: { users: { getAuthenticated: () => Promise<unknown> } } };
        await o.rest.users.getAuthenticated();
        result.github = true;
      } catch {
        result.github = false;
      }
    }

    if (masterPassword) {
      try {
        const encSession = await getEncryptedConfig("tg_session");
        const encApiId = await getEncryptedConfig("tg_api_id");
        const encApiHash = await getEncryptedConfig("tg_api_hash");

        if (encSession && encApiId && encApiHash) {
          const session = await decrypt(encSession, masterPassword);
          const apiId = parseInt(await decrypt(encApiId, masterPassword));
          const apiHash = await decrypt(encApiHash, masterPassword);

          const { testConnection } = await import("@/lib/telegram");
          result.telegram = await testConnection(apiId, apiHash, session);
        }
      } catch {
        result.telegram = false;
      }
    }

    return result;
  },

  resetAll: async () => {
    await clearAll();
    set({
      isUnlocked: false,
      hasMasterPassword: false,
      hasCredentials: false,
      hasPermanentSession: false,
      masterPassword: null,
      octokit: null,
      telegramClient: null,
    });
  },
}));
