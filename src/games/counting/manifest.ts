import type { GameManifest } from "../types";

export const COUNTING_GAME_ID = "math.counting-practice";

export const COUNTING_SKILL_IDS = {
  to25: "math.counting.to-25",
  to50: "math.counting.to-50",
  to100: "math.counting.to-100",
  recognition: "math.number-recognition",
  sequence: "math.number-sequence",
} as const;

export const countingManifest: GameManifest = {
  id: COUNTING_GAME_ID,
  title: "Counting Practice",
  description: "Hear, recognize, and count numbers at your own pace.",
  supportedGrades: ["K"],
  subject: "math",
  skillIds: Object.values(COUNTING_SKILL_IDS),
  requiredSettings: [],
  version: "1.0.0",
  route: "/games/counting-practice",
  accent: "#147c78",
};

export function countingRangeSkill(maximum: 25 | 50 | 100): string {
  return `math.counting.to-${maximum}`;
}
