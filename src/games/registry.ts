import { studentIdManifest } from "./student-id/manifest";
import { countingManifest } from "./counting/manifest";
import { letterSoundMatchManifest } from "./reading/letter-sound-match/manifest";
import { trickyWordMatchManifest } from "./reading/tricky-word-match/manifest";
import type { GameManifest } from "./types";

export const gameRegistry: readonly GameManifest[] = [
  countingManifest,
  letterSoundMatchManifest,
  trickyWordMatchManifest,
  studentIdManifest,
];

export function missingGameSettings(manifest: GameManifest, configuredKeys: readonly string[]): string[] {
  return manifest.requiredSettings.filter((required) => !configuredKeys.includes(required));
}
