/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: string;
  target?: string;
  before?: any;
  after?: any;
  source: string;
  user_input: string;
  result: string;
  model_used?: string;
  provider?: string;
}

const DB_NAME = "SiteForgeAuditLogs";
const STORE_NAME = "siteforge_audit_log";
const DB_VERSION = 1;

function getAuditDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onupgradeneeded = (e) => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("timestamp", "timestamp", { unique: false });
        store.createIndex("action", "action", { unique: false });
        store.createIndex("target", "target", { unique: false });
      }
    };
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function addAuditLog(entry: Omit<AuditLogEntry, "id" | "timestamp"> & { timestamp?: string }): Promise<AuditLogEntry> {
  try {
    const db = await getAuditDB();
    const id = "audit_" + Math.random().toString(36).substring(2, 11) + "_" + Date.now();
    const fullEntry: AuditLogEntry = {
      id,
      timestamp: entry.timestamp || new Date().toISOString(),
      action: entry.action,
      target: entry.target || "",
      before: entry.before || null,
      after: entry.after || null,
      source: entry.source || "System",
      user_input: entry.user_input || "",
      result: entry.result || "Success",
      model_used: entry.model_used || "local",
      provider: entry.provider || "ollama"
    };

    console.log("[AUDIT] Saving Audit Log:", fullEntry);

    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    await new Promise<void>((resolve, reject) => {
      const req = store.put(fullEntry);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });

    return fullEntry;
  } catch (err) {
    console.error("Failed to write to Audit database:", err);
    return {
      id: "fallback_id",
      timestamp: entry.timestamp || new Date().toISOString(),
      ...entry,
    } as AuditLogEntry;
  }
}

export async function getAuditLogs(): Promise<AuditLogEntry[]> {
  try {
    const db = await getAuditDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => {
        const sorted = (req.result || []).sort(
          (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        resolve(sorted);
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn("Audit database query failed:", err);
    return [];
  }
}

export async function getAuditLogsByFilter(filters: {
  action?: string;
  target?: string;
  startDate?: string;
  endDate?: string;
}): Promise<AuditLogEntry[]> {
  const logs = await getAuditLogs();
  return logs.filter(log => {
    if (filters.action && log.action !== filters.action) return false;
    if (filters.target && log.target !== filters.target) return false;
    if (filters.startDate) {
      if (new Date(log.timestamp).getTime() < new Date(filters.startDate).getTime()) return false;
    }
    if (filters.endDate) {
      if (new Date(log.timestamp).getTime() > new Date(filters.endDate).getTime()) return false;
    }
    return true;
  });
}

export async function clearAllAuditLogs(): Promise<void> {
  const db = await getAuditDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const req = store.clear();
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}
