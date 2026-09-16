import { openDB, type IDBPDatabase } from "idb";

const DB_NAME = "turbogit-web";
const DB_VERSION = 1;

interface TurboGitDB {
  config: {
    key: string;
    value: string;
  };
  masterHash: {
    key: string;
    value: string;
  };
}

let dbInstance: IDBPDatabase<TurboGitDB> | null = null;

async function getDB(): Promise<IDBPDatabase<TurboGitDB>> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<TurboGitDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains("config")) {
        db.createObjectStore("config");
      }
      if (!db.objectStoreNames.contains("masterHash")) {
        db.createObjectStore("masterHash");
      }
    },
  });

  return dbInstance;
}

export async function getEncryptedConfig(key: string): Promise<string | null> {
  const db = await getDB();
  return db.get("config", key);
}

export async function setEncryptedConfig(
  key: string,
  value: string
): Promise<void> {
  const db = await getDB();
  await db.put("config", value, key);
}

export async function deleteEncryptedConfig(key: string): Promise<void> {
  const db = await getDB();
  await db.delete("config", key);
}

export async function getAllEncryptedConfig(): Promise<Record<string, string>> {
  const db = await getDB();
  const tx = db.transaction("config", "readonly");
  const store = tx.objectStore("config");
  const result: Record<string, string> = {};

  let cursor = await store.openCursor();
  while (cursor) {
    result[cursor.key as string] = cursor.value;
    cursor = await cursor.continue();
  }

  return result;
}

export async function getMasterHash(): Promise<string | null> {
  const db = await getDB();
  return db.get("masterHash", "hash");
}

export async function setMasterHash(hash: string): Promise<void> {
  const db = await getDB();
  await db.put("masterHash", hash, "hash");
}

export async function clearAll(): Promise<void> {
  const db = await getDB();
  const txConfig = db.transaction("config", "readwrite");
  await txConfig.objectStore("config").clear();
  await txConfig.done;
  const txHash = db.transaction("masterHash", "readwrite");
  await txHash.objectStore("masterHash").clear();
  await txHash.done;
}
