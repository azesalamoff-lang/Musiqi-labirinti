// IndexedDB wrapper for storing custom logos and stage/category images safely
const DB_NAME = 'MusiqiLabirintiImagesDB';
const DB_VERSION = 1;
const STORE_NAME = 'customImages';

interface ImageRecord {
  key: string;
  dataUrl: string;
  updatedAt: number;
}

function openImageDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB is not supported'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'key' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Convert File to compressed DataURL for fast cross-session display & memory safety
function fileToDataUrl(file: File, maxWidth = 1200, maxHeight = 1200, quality = 0.88): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        // Use PNG if original has transparency or is SVG/PNG, otherwise JPEG
        const isPng = file.type === 'image/png' || file.type === 'image/svg+xml';
        const mime = isPng ? 'image/png' : 'image/jpeg';
        resolve(canvas.toDataURL(mime, quality));
      };
      img.onerror = () => {
        resolve(e.target?.result as string);
      };
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// In-memory cache for instant synchronous reading
const memoryImageCache: Record<string, string> = {};

export async function saveStoredImage(key: string, file: File): Promise<string> {
  const dataUrl = await fileToDataUrl(file);
  memoryImageCache[key] = dataUrl;

  try {
    const db = await openImageDB();
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const record: ImageRecord = {
        key,
        dataUrl,
        updatedAt: Date.now()
      };
      const req = store.put(record);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Could not save image to IndexedDB, fallback to localStorage', err);
    try {
      localStorage.setItem(`img_${key}`, dataUrl);
    } catch (e) {
      console.warn('localStorage full as well', e);
    }
  }

  // Notify components of updated image
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('applet-image-updated', { detail: { key, dataUrl } }));
  }

  return dataUrl;
}

export async function getStoredImage(key: string): Promise<string | null> {
  if (memoryImageCache[key]) {
    return memoryImageCache[key];
  }

  try {
    const db = await openImageDB();
    return new Promise((resolve) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const req = store.get(key);
      req.onsuccess = () => {
        const record = req.result as ImageRecord | undefined;
        if (record?.dataUrl) {
          memoryImageCache[key] = record.dataUrl;
          resolve(record.dataUrl);
        } else {
          // Check localStorage fallback
          const local = localStorage.getItem(`img_${key}`);
          if (local) {
            memoryImageCache[key] = local;
            resolve(local);
          } else {
            resolve(null);
          }
        }
      };
      req.onerror = () => {
        const local = localStorage.getItem(`img_${key}`);
        resolve(local || null);
      };
    });
  } catch {
    const local = localStorage.getItem(`img_${key}`);
    return local || null;
  }
}

export async function deleteStoredImage(key: string): Promise<void> {
  delete memoryImageCache[key];
  try {
    localStorage.removeItem(`img_${key}`);
  } catch {
    // ignore
  }

  try {
    const db = await openImageDB();
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const req = store.delete(key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Could not delete image from IndexedDB', err);
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('applet-image-updated', { detail: { key, dataUrl: null } }));
  }
}

export async function getAllStoredImages(): Promise<Record<string, string>> {
  const result: Record<string, string> = { ...memoryImageCache };
  try {
    const db = await openImageDB();
    return new Promise((resolve) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => {
        const records = req.result as ImageRecord[];
        records.forEach(r => {
          result[r.key] = r.dataUrl;
          memoryImageCache[r.key] = r.dataUrl;
        });
        resolve(result);
      };
      req.onerror = () => resolve(result);
    });
  } catch {
    return result;
  }
}
