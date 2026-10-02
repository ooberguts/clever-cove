import type { AppData } from "../domain/models";
import { AnonymousExportService } from "../services/anonymousExportService";
import { AppDataService } from "../services/appDataService";
import { ParentSettingsService } from "../services/parentSettingsService";
import { PrivateValueService } from "../services/privateValueService";
import { ProfileService } from "../services/profileService";
import { ProgressService } from "../services/progressService";
import type { AppStorage } from "../services/storage";
import { UpdateService } from "../services/updateService";
import { GameSoundService } from "../services/gameSoundService";
import { LearningPreferencesService } from "../services/learningPreferencesService";
import { AudioService } from "../services/audioService";

export class MemoryStorage implements AppStorage {
  data: AppData | null = null;
  backups: AppData[] = [];
  async load() { return this.data ? structuredClone(this.data) : null; }
  async save(data: AppData) { this.data = structuredClone(data); }
  async backup(data: AppData) { this.backups.push(structuredClone(data)); }
}

export async function createTestServices() {
  const storage = new MemoryStorage();
  const appData = new AppDataService(storage);
  await appData.initialize();
  return {
    storage,
    services: {
      appData,
      profiles: new ProfileService(appData),
      privateValues: new PrivateValueService(appData),
      parentSettings: new ParentSettingsService(appData),
      progress: new ProgressService(appData),
      anonymousExport: new AnonymousExportService(appData),
      updates: new UpdateService(),
      sounds: new GameSoundService(),
      learningPreferences: new LearningPreferencesService(appData),
      audio: new AudioService(),
    },
  };
}
