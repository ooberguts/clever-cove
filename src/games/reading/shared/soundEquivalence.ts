import type { LetterContent, TrickyWordContent } from "../../../content";

/** Letters with the same taught primary sound must never share a question. */
export function letterSoundKey(letter: LetterContent): string {
  return letter.soundGroup ?? letter.phonemeAudioId;
}

/** Spoken homophones must never share a listening question. */
export function trickyWordSoundKey(word: TrickyWordContent): string {
  return word.homophoneGroup ?? word.audioId;
}
