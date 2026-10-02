export type AudioAssetKind = "number" | "letter-name" | "phoneme" | "word" | "prompt";

export type AudioReviewStatus = "generated" | "adult-review-required" | "adult-reviewed";

export interface AudioAssetDefinition {
  id: string;
  kind: AudioAssetKind;
  text: string;
  path: string;
  reviewStatus: AudioReviewStatus;
}

export interface NumberContent {
  id: `number.${number}`;
  value: number;
  display: string;
  audioId: `number.${number}`;
}

export interface LetterContent {
  id: `letter.${string}`;
  uppercase: string;
  lowercase: string;
  display: string;
  letterNameAudioId: `letter.${string}.name`;
  phonemeAudioId: `phoneme.${string}`;
  soundGroup?: string;
}

export interface TrickyWordContent {
  id: `word.${string}`;
  text: string;
  audioId: `word.${string}`;
  homophoneGroup?: string;
}

export interface TrickyWordGroup {
  id: `tricky.term-${1 | 2 | 3 | 4}`;
  label: string;
  wordIds: Array<`word.${string}`>;
}

export interface TrickyWordDistractorGroup {
  id: `tricky.distractors.${string}`;
  wordIds: Array<`word.${string}`>;
}

export interface KindergartenContentPack {
  id: "content.kindergarten.core";
  numbers: NumberContent[];
  letters: LetterContent[];
  trickyWords: TrickyWordContent[];
  trickyWordGroups: TrickyWordGroup[];
  trickyWordDistractorGroups: TrickyWordDistractorGroup[];
}
