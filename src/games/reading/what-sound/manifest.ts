import type { GameManifest } from "../../types";

export const WHAT_SOUND_GAME_ID = "reading.what-sound";
export const WHAT_SOUND_SKILL_ID = "reading.letter-sound-correspondence";

export const whatSoundManifest: GameManifest = {
  id: WHAT_SOUND_GAME_ID,
  title: "What Sound?",
  description: "See a letter and choose the sound it makes.",
  supportedGrades: ["K"],
  subject: "reading",
  skillIds: ["reading.letter-recognition", WHAT_SOUND_SKILL_ID],
  requiredSettings: [],
  version: "1.0.0",
  route: "/games/what-sound",
  accent: "#6d4bc2",
};
