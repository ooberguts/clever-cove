import type { AppData, LearnerPreferences, StoredLearner } from "../domain/models";
import type { AppStorage } from "./storage";

export const CURRENT_SCHEMA_VERSION = 3;

export const DEFAULT_LEARNER_PREFERENCES: LearnerPreferences = {
  countingMaximum: 25,
  letterFocusIds: [],
  trickyWordGroup: "all",
};

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
      if (migrated.schemaVersion === 1) {
        for (const learner of migrated.learners as StoredLearner[]) {
          learner.preferences = structuredClone(DEFAULT_LEARNER_PREFERENCES);
          learner.learningProgress = {};
          learner.schemaVersion = 2;
        }
        migrated.schemaVersion = 2;
        continue;
      }
      if (migrated.schemaVersion === 2) {
        for (const learner of migrated.learners as StoredLearner[]) {
          for (const progress of Object.values(learner.progress)) progress.daily = {};
          for (const progress of Object.values(learner.learningProgress)) progress.daily = {};
          learner.schemaVersion = 3;
        }
        migrated.schemaVersion = 3;
        continue;
      }
      throw new Error(`No migration is available for schema ${migrated.schemaVersion}.`);
    }
    return migrated;
  }
}
