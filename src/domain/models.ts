export const GRADES = ["K", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"] as const;
export type Grade = (typeof GRADES)[number];

export interface GameProgress {
  gameId: string;
  attempts: number;
  successes: number;
  completedRounds: number;
  sessions: number;
  lastPlayedAt?: string;
}

export interface LearnerProfile {
  id: string;
  displayName: string;
  grade: Grade;
  createdAt: string;
  schemaVersion: number;
  progress: Record<string, GameProgress>;
  gameConfigurationRefs: string[];
}

export interface PrivateValues {
  "private.student_id"?: string;
}

export interface StoredLearner extends LearnerProfile {
  privateValues: PrivateValues;
}

export interface ParentCredentials {
  salt: string;
  pinHash: string;
}

export interface AppData {
  schemaVersion: number;
  learners: StoredLearner[];
  parentCredentials?: ParentCredentials;
}

export type PrivateSettingKey = keyof PrivateValues;

export interface AnonymousGameExport {
  game_id: string;
  configured: boolean;
  input_length: number;
  attempts: number;
  successes: number;
  success_rate: number;
}

export interface AnonymousExport {
  export_version: 1;
  generated_at: string;
  learners: Array<{
    anonymous_id: string;
    grade: Grade;
    games: AnonymousGameExport[];
  }>;
}
