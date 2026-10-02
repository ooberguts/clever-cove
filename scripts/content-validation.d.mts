export interface ContentValidationInput {
  numberRange: { minimum: number; maximum: number; supportedPracticeMaximums: number[] };
  letters: Array<Record<string, unknown>>;
  trickyWords: {
    words: Array<Record<string, unknown>>;
    groups: Array<Record<string, unknown>>;
    distractorGroups: Array<Record<string, unknown>>;
  };
  audioAssets: Array<Record<string, unknown>>;
}

export function loadContentFromDisk(rootUrl?: URL): Promise<ContentValidationInput>;
export function validateContent(input: ContentValidationInput): string[];
