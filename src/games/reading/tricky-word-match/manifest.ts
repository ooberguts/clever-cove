import type { GameManifest } from "../../types";

export const TRICKY_WORD_MATCH_GAME_ID = "reading.tricky-word-match";
export const TRICKY_WORD_SKILL_ID = "reading.sight-word-recognition";
export const TRICKY_WORD_PROMPT_AUDIO_ID = "prompt.reading.tricky-word-match";

export const trickyWordMatchManifest: GameManifest = {
  id: TRICKY_WORD_MATCH_GAME_ID,
  title: "Tricky Word Match",
  description: "Listen carefully and find the word you heard.",
  supportedGrades: ["K"],
  subject: "reading",
  skillIds: [TRICKY_WORD_SKILL_ID, "reading.auditory-word-matching", "reading.word-recognition"],
  requiredSettings: [],
  version: "1.0.0",
  route: "/games/tricky-word-match",
  accent: "#d56b16",
};
