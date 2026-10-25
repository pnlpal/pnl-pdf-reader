import { Injectable } from '@angular/core';

export interface RecentFile {
  id: string;
  name: string;
  size: number;
  page: number;
  pagesCount: number;
  lastOpened: number;
}

interface StoredFile extends RecentFile {
  data: ArrayBuffer;
}

export const MAX_RECENT_FILES = 5;
const DB_NAME = 'pnl-pdf-reader';
const STORE = 'files';
const CURRENT_KEY = 'pdf-reader:current';

// Keeps the most recent PDFs in this browser's IndexedDB so a refresh doesn't
// lose them. Nothing is sent to a server. Every method fails soft (private
// mode, quota, blocked storage): the app just works without history.
@Injectable({ providedIn: 'root' })
export class RecentFilesService {
  private db: Promise<IDBDatabase> | null = null;
  private persistRequested = false;

  async list(): Promise<RecentFile[]> {
    const files = await this.run<StoredFile[]>('readonly', (store) => store.getAll()).catch(() => []);
    return files
      .map(({ data, ...meta }) => meta)
      .sort((a, b) => b.lastOpened - a.lastOpened);
  }

  async get(id: string): Promise<StoredFile | undefined> {
    return this.run<StoredFile | undefined>('readonly', (store) => store.get(id)).catch(() => undefined);
  }

  // Returns the new file's id, or null when it couldn't be saved.
  async add(name: string, data: ArrayBuffer): Promise<string | null> {
    const file: StoredFile = {
      id: crypto.randomUUID(),
      name,
      size: data.byteLength,
      page: 1,
      pagesCount: 0,
      lastOpened: Date.now(),
      // pdf.js takes over the buffer it's given, so store a copy.
      data: data.slice(0),
    };
    try {
      await this.run('readwrite', (store) => store.put(file));
    } catch (error) {
      console.warn('Could not save the PDF to this browser:', error);
      return null;
    }
    this.requestPersistence();
    const extra = (await this.list()).slice(MAX_RECENT_FILES);
    await Promise.all(extra.map((f) => this.remove(f.id)));
    return file.id;
  }

  async updatePosition(id: string, page: number, pagesCount?: number): Promise<void> {
    await this.patch(id, (file) => {
      file.page = page;
      if (pagesCount) file.pagesCount = pagesCount;
    });
  }

  async touch(id: string): Promise<void> {
    await this.patch(id, (file) => (file.lastOpened = Date.now()));
  }

  async remove(id: string): Promise<void> {
    await this.run('readwrite', (store) => store.delete(id)).catch(() => undefined);
    if (this.currentId === id) this.currentId = null;
  }

  async clear(): Promise<void> {
    await this.run('readwrite', (store) => store.clear()).catch(() => undefined);
    this.currentId = null;
  }

  // The file to reopen on refresh.
  get currentId(): string | null {
    try {
      return localStorage.getItem(CURRENT_KEY);
    } catch {
      return null;
    }
  }

  set currentId(id: string | null) {
    try {
      if (id) localStorage.setItem(CURRENT_KEY, id);
      else localStorage.removeItem(CURRENT_KEY);
    } catch {
      // Storage blocked: refresh just won't reopen the file.
    }
  }

  private async patch(id: string, change: (file: StoredFile) => void): Promise<void> {
    const file = await this.get(id);
    if (!file) return;
    change(file);
    await this.run('readwrite', (store) => store.put(file)).catch(() => undefined);
  }

  // Asks the browser not to evict our files when disk space runs low.
  private requestPersistence(): void {
    if (this.persistRequested) return;
    this.persistRequested = true;
    navigator.storage?.persist?.().catch(() => undefined);
  }

  private open(): Promise<IDBDatabase> {
    this.db ??= new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = () => request.result.createObjectStore(STORE, { keyPath: 'id' });
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    }).catch((error) => {
      this.db = null;
      throw error;
    });
    return this.db;
  }

  private async run<T = unknown>(
    mode: IDBTransactionMode,
    action: (store: IDBObjectStore) => IDBRequest,
  ): Promise<T> {
    const db = await this.open();
    return new Promise<T>((resolve, reject) => {
      const tx = db.transaction(STORE, mode);
      const request = action(tx.objectStore(STORE));
      tx.oncomplete = () => resolve(request.result as T);
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  }
}
