// IndexedDB wrapper for high-performance non-blocking audio storage
const DB_NAME = 'MusiqiLabirintiAudioDB';
const DB_VERSION = 1;
const STORE_NAME = 'audioTracks';

interface AudioRecord {
  id: string; // songId
  blob: Blob;
  fileName: string;
  mimeType: string;
  size: number;
  updatedAt: number;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB is not supported in this browser environment'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

// In-memory cache of active ObjectURLs to avoid repeated blob decoding
const activeObjectUrls = new Map<string, string>();

export async function saveAudioTrack(songId: string, file: File | Blob, fileName: string): Promise<void> {
  // Revoke previous URL if exists
  if (activeObjectUrls.has(songId)) {
    URL.revokeObjectURL(activeObjectUrls.get(songId)!);
    activeObjectUrls.delete(songId);
  }

  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const record: AudioRecord = {
      id: songId,
      blob: file,
      fileName,
      mimeType: file.type || 'audio/mpeg',
      size: file.size,
      updatedAt: Date.now()
    };
    const req = store.put(record);

    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function getAudioTrackUrl(songId: string): Promise<string | null> {
  if (activeObjectUrls.has(songId)) {
    return activeObjectUrls.get(songId)!;
  }

  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const req = store.get(songId);

      req.onsuccess = () => {
        const record = req.result as AudioRecord | undefined;
        if (record && record.blob) {
          const url = URL.createObjectURL(record.blob);
          activeObjectUrls.set(songId, url);
          resolve(url);
        } else {
          resolve(null);
        }
      };

      req.onerror = () => {
        resolve(null);
      };
    });
  } catch (err) {
    console.warn('Error reading from IndexedDB:', err);
    return null;
  }
}

export async function deleteAudioTrack(songId: string): Promise<void> {
  if (activeObjectUrls.has(songId)) {
    URL.revokeObjectURL(activeObjectUrls.get(songId)!);
    activeObjectUrls.delete(songId);
  }

  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const req = store.delete(songId);
      req.onsuccess = () => resolve();
      req.onerror = () => resolve();
    });
  } catch {
    // ignore
  }
}

export async function clearAllAudioTracks(): Promise<void> {
  activeObjectUrls.forEach((url) => URL.revokeObjectURL(url));
  activeObjectUrls.clear();

  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const req = store.clear();
      req.onsuccess = () => resolve();
      req.onerror = () => resolve();
    });
  } catch {
    // ignore
  }
}

export async function checkHasCustomAudio(songId: string): Promise<boolean> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const req = store.count(songId);
      req.onsuccess = () => resolve(req.result > 0);
      req.onerror = () => resolve(false);
    });
  } catch {
    return false;
  }
}

export async function getAllAudioRecords(): Promise<AudioRecord[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('getAllAudioRecords error:', err);
    return [];
  }
}

export interface BackupPackageData {
  version: number;
  exportedAt: string;
  songs: {
    stage1: import('../types').SongItem[];
    stage2: import('../types').SongItem[];
    stage3: import('../types').SongItem[];
    finalist1: import('../types').SongItem[];
    finalist2: import('../types').SongItem[];
  };
}

/**
 * Creates a portable ZIP archive containing all song configurations and audio files.
 * Provides onProgress callback (0 to 100).
 */
export async function exportTournamentBackupZip(
  songs: BackupPackageData['songs'],
  onProgress?: (percent: number, statusText: string) => void
): Promise<Blob> {
  const JSZip = (await import('jszip')).default;
  const zip = new JSZip();

  onProgress?.(10, 'Audio fayllar yaddaşdan toplanır...');
  const audioRecords = await getAllAudioRecords();

  const manifest: BackupPackageData = {
    version: 1,
    exportedAt: new Date().toISOString(),
    songs
  };

  zip.file('manifest.json', JSON.stringify(manifest, null, 2));

  const audioFolder = zip.folder('audio');
  const totalAudios = audioRecords.length;

  for (let i = 0; i < totalAudios; i++) {
    const rec = audioRecords[i];
    if (rec.blob && audioFolder) {
      // Store under rec.id with proper extension if available
      const ext = rec.fileName?.includes('.') ? rec.fileName.substring(rec.fileName.lastIndexOf('.')) : '.mp3';
      audioFolder.file(`${rec.id}${ext}`, rec.blob, { binary: true });
    }
    const percent = Math.round(15 + ((i + 1) / (totalAudios || 1)) * 40);
    onProgress?.(percent, `Audio fayllar paketlənir (${i + 1}/${totalAudios})...`);
  }

  onProgress?.(60, 'ZIP faylı sıxışdırılır və hazırlanır...');

  const zipBlob = await zip.generateAsync(
    { 
      type: 'blob', 
      compression: 'DEFLATE',
      compressionOptions: { level: 6 } 
    },
    (metadata) => {
      const progress = Math.round(60 + (metadata.percent / 100) * 38);
      onProgress?.(progress, `Arxiv hazırlanır: ${Math.round(metadata.percent)}%`);
    }
  );

  onProgress?.(100, 'Tamamlandı!');
  return zipBlob;
}

/**
 * Extracts a tournament backup ZIP file, restores all audio files into IndexedDB,
 * and returns the parsed song metadata.
 */
export async function importTournamentBackupZip(
  file: File,
  onProgress?: (percent: number, statusText: string) => void
): Promise<BackupPackageData['songs']> {
  const JSZip = (await import('jszip')).default;
  onProgress?.(10, 'Yedək faylı açılır...');

  const zip = await JSZip.loadAsync(file);

  const manifestFile = zip.file('manifest.json');
  if (!manifestFile) {
    throw new Error('Düzgün yedək arxivi deyil (manifest.json tapılmadı).');
  }

  const manifestJsonStr = await manifestFile.async('string');
  const manifestData: BackupPackageData = JSON.parse(manifestJsonStr);

  onProgress?.(25, 'Audio fayllar bərpa olunur...');

  const audioFolder = zip.folder('audio');
  if (audioFolder) {
    const audioFiles: { name: string; file: import('jszip').JSZipObject }[] = [];
    audioFolder.forEach((relativePath, fileObj) => {
      if (!fileObj.dir) {
        audioFiles.push({ name: relativePath, file: fileObj });
      }
    });

    const total = audioFiles.length;
    for (let i = 0; i < total; i++) {
      const item = audioFiles[i];
      const blob = await item.file.async('blob');
      // Extract song ID from filename (e.g. "s1_80_1.mp3" -> "s1_80_1")
      const songId = item.name.replace(/\.[^/.]+$/, '');
      await saveAudioTrack(songId, blob, item.name);

      const percent = Math.round(25 + ((i + 1) / (total || 1)) * 70);
      onProgress?.(percent, `Audio bərpa edilir (${i + 1}/${total}): ${item.name}...`);
    }
  }

  onProgress?.(100, 'Bütün mahnılar və audio fayllar uğurla bərpa olundu!');
  return manifestData.songs;
}
