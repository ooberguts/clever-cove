import { GRADES } from "../../domain/models";
import type { GameManifest } from "../types";

export const STUDENT_ID_GAME_ID = "life-skills.student-id";

export const studentIdManifest: GameManifest = {
  id: STUDENT_ID_GAME_ID,
  title: "Student ID Practice",
  description: "Practice entering your school student ID.",
  supportedGrades: GRADES,
  subject: "life-skills",
  skillIds: ["life-skills.student-id-entry", "input.numeric-keypad"],
  requiredSettings: ["private.student_id"],
  version: "1.0.0",
  route: "/games/student-id",
  accent: "#6645d7",
};
