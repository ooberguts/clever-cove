import { relaunch } from "@tauri-apps/plugin-process";
import { check } from "@tauri-apps/plugin-updater";
import packageInfo from "../../package.json";

export type UpdateStatus =
  | { state: "web-preview" }
  | { state: "current" }
  | { state: "available"; version: string; install: () => Promise<void> };

export class UpdateService {
  currentVersion(): string {
    return `v${packageInfo.version}`;
  }

  async check(): Promise<UpdateStatus> {
    if (!("__TAURI_INTERNALS__" in window)) return { state: "web-preview" };
    const update = await check();
    if (!update) return { state: "current" };
    return {
      state: "available",
      version: update.version,
      install: async () => {
        await update.downloadAndInstall();
        await relaunch();
      },
    };
  }
}
