import { AnonymousExportService } from "./anonymousExportService";
import { AppDataService } from "./appDataService";
import { ParentSettingsService } from "./parentSettingsService";
import { PrivateValueService } from "./privateValueService";
import { ProfileService } from "./profileService";
import { ProgressService } from "./progressService";
import { createStorage } from "./storage";
import { UpdateService } from "./updateService";

export function createServices() {
  const appData = new AppDataService(createStorage());
  return {
    appData,
    profiles: new ProfileService(appData),
    privateValues: new PrivateValueService(appData),
    parentSettings: new ParentSettingsService(appData),
    progress: new ProgressService(appData),
    anonymousExport: new AnonymousExportService(appData),
    updates: new UpdateService(),
  };
}

export type AppServices = ReturnType<typeof createServices>;
