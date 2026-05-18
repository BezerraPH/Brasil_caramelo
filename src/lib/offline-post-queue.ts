"use client";

const DB_NAME = "brasil-caramelo-offline";
const STORE = "pending-posts";
const DB_VERSION = 1;

export type PendingPost = {
  id: string;
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  communityLevel?: string;
  createdAt: number;
};

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve(req.result);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "id" });
      }
    };
  });
}

export async function enqueueOfflinePost(
  post: Omit<PendingPost, "id" | "createdAt">,
): Promise<string> {
  const db = await openDb();
  const id = crypto.randomUUID();
  const item: PendingPost = {
    ...post,
    id,
    createdAt: Date.now(),
  };
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(item);
    tx.oncomplete = () => resolve(id);
    tx.onerror = () => reject(tx.error);
  });
}

export async function listOfflinePosts(): Promise<PendingPost[]> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).getAll();
    req.onsuccess = () =>
      resolve(
        (req.result as PendingPost[]).sort(
          (a, b) => a.createdAt - b.createdAt,
        ),
      );
    req.onerror = () => reject(req.error);
  });
}

export async function removeOfflinePost(id: string): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function flushOfflinePosts(): Promise<number> {
  const pending = await listOfflinePosts();
  let synced = 0;
  for (const item of pending) {
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: item.content || undefined,
          imageUrl: item.imageUrl,
          videoUrl: item.videoUrl,
          communityLevel: item.communityLevel,
        }),
      });
      if (res.ok) {
        await removeOfflinePost(item.id);
        synced += 1;
      }
    } catch {
      break;
    }
  }
  return synced;
}

export async function registerBackgroundSync(): Promise<void> {
  if (!("serviceWorker" in navigator)) return;
  try {
    const reg = await navigator.serviceWorker.ready;
    if ("sync" in reg) {
      await (
        reg as ServiceWorkerRegistration & {
          sync: { register: (tag: string) => Promise<void> };
        }
      ).sync.register("bc-post-sync");
    }
  } catch {
    /* ignorar */
  }
}
