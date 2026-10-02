import type { GameManifest } from "../../types";

export const LETTER_SOUND_MATCH_GAME_ID = "reading.letter-sound-match";
export const LETTER_SOUND_SKILL_ID = "reading.letter-sound-correspondence";
export const LETTER_SOUND_PROMPT_AUDIO_ID = "prompt.reading.letter-sound-match";

export const letterSoundMatchManifest: GameManifest = {
  id: LETTER_SOUND_MATCH_GAME_ID,
  title: "Letter Sound Match",
  description: "Listen to a sound and find the letter that makes it.",
  supportedGrades: ["K"],
  subject: "reading",
  skillIds: [
    "reading.letter-recognition",
    "reading.uppercase-recognition",
    "reading.lowercase-recognition",
    LETTER_SOUND_SKILL_ID,
  ],
  requiredSettings: [],
  version: "1.0.0",
  route: "/games/letter-sound-match",
  accent: "#0f8a74",
};
