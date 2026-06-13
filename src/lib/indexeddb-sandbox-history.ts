/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SandboxHistoryItem {
  id: string;
  prompt: string;
  agent: string;
  model: string;
  timestamp: number;
  success: boolean;
  parsedCommand?: string;
}

const DB_NAME = "SiteForgeSandbox";
const STORE_NAME = "sandbox_history";
const DB_VERSION = 1;

function getDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onupgradeneeded = (e) => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveHistoryPrompt(
  prompt: string,
  agent: string,
  model: string,
  success: boolean,
  parsedCommand?: string
): Promise<SandboxHistoryItem> {
  const db = await getDB();
  const id = "history_" + Math.random().toString(36).substring(2, 11);
  const item: SandboxHistoryItem = {
    id,
    prompt,
    agent,
    model,
    timestamp: Date.now(),
    success,
    parsedCommand
  };

  // Keep last 20 queries only. Get all, sort, prune oldest, store new one.
  const all = await getHistoryPrompts();
  all.push(item);
  all.sort((a, b) => b.timestamp - a.timestamp); // newest first

  // Prune down to 20
  const keepers = all.slice(0, 20);

  // Perform transactions
  const tx = db.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);
  
  // Clear first, then load keepers
  await new Promise<void>((resolve, reject) => {
    const clearReq = store.clear();
    clearReq.onsuccess = () => resolve();
    clearReq.onerror = () => reject(clearReq.error);
  });

  for (const k of keepers) {
    store.put(k);
  }

  return item;
}

export async function getHistoryPrompts(): Promise<SandboxHistoryItem[]> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAll();
      
      request.onsuccess = () => {
        const sorted = (request.result || []).sort((a, b) => b.timestamp - a.timestamp);
        resolve(sorted);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn("IndexedDB sandbox history check failed or initial state:", err);
    return [];
  }
}

export async function clearHistoryPrompts(): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const request = store.clear();
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}
