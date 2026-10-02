import { load, type Store } from "@tauri-apps/plugin-store";
import type { AppData } from "../domain/models";

const STORE_KEY = "app-data";
const STORE_FILE = "clever-cove.json";

export interface AppStorage {
  load(): Promise<AppData | null>;
  save(data: AppData): Promise<void>;
  backup(data: AppData): Promise<void>;
}

function isTauriRuntime(): boolean {
  return "__TAURI_INTERNALS__" in window;
}

export class BrowserStorage implements AppStorage {
  constructor(private readonly key = "clever-cove.app-data") {}

  async load(): Promise<AppData | null> {
    const value = localStorage.getItem(this.key);
    return value ? (JSON.parse(value) as AppData) : null;
  }

  async save(data: AppData): Promise<void> {
    localStorage.setItem(this.key, JSON.stringify(data));
  }

  async backup(data: AppData): Promise<void> {
    const suffix = new Date().toISOString().replaceAll(":", "-");
    localStorage.setItem(`${this.key}.backup.${suffix}`, JSON.stringify(data));
  }
}

export class TauriStorage implements AppStorage {
  private storePromise?: Promise<Store>;

  private store(): Promise<Store> {
    this.storePromise ??= load(STORE_FILE, { autoSave: false });
    return this.storePromise;
  }

  async load(): Promise<AppData | null> {
    return (await (await this.store()).get<AppData>(STORE_KEY)) ?? null;
  }

  async save(data: AppData): Promise<void> {
    const store = await this.store();
    await store.set(STORE_KEY, data);
    await store.save();
  }

  async backup(data: AppData): Promise<void> {
    const backupStore = await load(`backups/app-data-${Date.now()}.json`, { autoSave: false });
    await backupStore.set(STORE_KEY, data);
    await backupStore.save();
  }
}

export function createStorage(): AppStorage {
  return isTauriRuntime() ? new TauriStorage() : new BrowserStorage();
}
