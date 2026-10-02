import type { AppData } from "../domain/models";
import type { AppStorage } from "./storage";

export const CURRENT_SCHEMA_VERSION = 1;

const EMPTY_DATA: AppData = {
  schemaVersion: CURRENT_SCHEMA_VERSION,
  learners: [],
};

export class AppDataService {
  private data: AppData | null = null;

  constructor(private readonly storage: AppStorage) {}

  async initialize(): Promise<AppData> {
    const stored = await this.storage.load();
    this.data = stored ?? structuredClone(EMPTY_DATA);
    if (this.data.schemaVersion < CURRENT_SCHEMA_VERSION) {
      await this.storage.backup(this.data);
      this.data = this.migrate(this.data);
      await this.storage.save(this.data);
    }
    return this.snapshot();
  }

  get(): AppData {
    if (!this.data) throw new Error("App data has not been initialized.");
    return this.data;
  }

  snapshot(): AppData {
    return structuredClone(this.get());
  }

  async update(mutate: (data: AppData) => void): Promise<AppData> {
    const next = this.snapshot();
    mutate(next);
    await this.storage.save(next);
    this.data = next;
    return this.snapshot();
  }

  private migrate(data: AppData): AppData {
    const migrated = structuredClone(data);
    while (migrated.schemaVersion < CURRENT_SCHEMA_VERSION) {
      throw new Error(`No migration is available for schema ${migrated.schemaVersion}.`);
    }
    return migrated;
  }
}
