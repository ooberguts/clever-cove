export const GRADES = ["K", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"] as const;
export type Grade = (typeof GRADES)[number];

export const COUNTING_MAXIMUMS = [25, 50, 100] as const;
export type CountingMaximum = (typeof COUNTING_MAXIMUMS)[number];

export const TRICKY_WORD_GROUPS = ["tricky.term-1", "tricky.term-2", "tricky.term-3", "tricky.term-4", "all"] as const;
export type TrickyWordGroup = (typeof TRICKY_WORD_GROUPS)[number];

export interface LearnerPreferences {
  countingMaximum: CountingMaximum;
  letterFocusIds: string[];
  trickyWordGroup: TrickyWordGroup;
}

export interface LearningContentProgress {
  skillId: string;
  contentId: string;
  attempts: number;
  correct: number;
  lastPracticedAt?: string;
}

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
  learningProgress: Record<string, LearningContentProgress>;
  preferences: LearnerPreferences;
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
  completed_rounds: number;
  sessions: number;
}

export interface AnonymousLearningExport {
  skill_id: string;
  content_id: string;
  attempts: number;
  correct: number;
}

export interface AnonymousExport {
  export_version: 2;
  generated_at: string;
  learners: Array<{
    anonymous_id: string;
    grade: Grade;
    games: AnonymousGameExport[];
    learning_preferences: {
      counting_maximum: CountingMaximum;
      letter_focus_count: number;
      tricky_word_group: TrickyWordGroup;
    };
    learning: AnonymousLearningExport[];
  }>;
}
