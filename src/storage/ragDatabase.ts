const DB_NAME = "rag-visualizer";
const DB_VERSION = 1;
const CORPUS_STORE = "corpora";

let dbPromise: Promise<IDBDatabase> | null = null;

function openDatabase(): Promise<IDBDatabase> {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      if (typeof indexedDB === "undefined") {
        reject(new Error("IndexedDB is not available in this browser."));
        return;
      }
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(CORPUS_STORE)) {
          db.createObjectStore(CORPUS_STORE, { keyPath: "documentId" });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => {
        dbPromise = null;
        reject(request.error ?? new Error("Failed to open IndexedDB."));
      };
    });
  }
  return dbPromise;
}

function runTransaction<T>(
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> {
  return openDatabase().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const tx = db.transaction(CORPUS_STORE, mode);
        const store = tx.objectStore(CORPUS_STORE);
        const request = fn(store);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error ?? new Error("IndexedDB request failed."));
      })
  );
}

export async function idbGet<T>(key: string): Promise<T | undefined> {
  try {
    return await runTransaction("readonly", (store) => store.get(key));
  } catch {
    return undefined;
  }
}

export async function idbPut<T extends { documentId: string }>(value: T): Promise<void> {
  await runTransaction("readwrite", (store) => store.put(value));
}

export async function idbDelete(key: string): Promise<void> {
  try {
    await runTransaction("readwrite", (store) => store.delete(key));
  } catch {
    /* ignore */
  }
}

export async function idbClear(): Promise<void> {
  try {
    await runTransaction("readwrite", (store) => store.clear());
  } catch {
    /* ignore */
  }
}
