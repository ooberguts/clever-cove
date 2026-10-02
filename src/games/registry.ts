import { studentIdManifest } from "./student-id/manifest";
import type { GameManifest } from "./types";

export const gameRegistry: readonly GameManifest[] = [studentIdManifest];

export function missingGameSettings(manifest: GameManifest, configuredKeys: readonly string[]): string[] {
  return manifest.requiredSettings.filter((required) => !configuredKeys.includes(required));
}
