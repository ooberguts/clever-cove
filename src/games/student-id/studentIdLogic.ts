export const KEYPAD_KEYS = ["7", "8", "9", "4", "5", "6", "1", "2", "3", "CLEAR", "0", "ENTER"] as const;
export type KeypadKey = (typeof KEYPAD_KEYS)[number];

export interface StudentIdGameState {
  input: string;
  feedback: "idle" | "success" | "retry";
}

export const INITIAL_GAME_STATE: StudentIdGameState = { input: "", feedback: "idle" };

export function appendDigit(input: string, digit: string): string {
  if (!/^\d$/.test(digit) || input.length >= 12) return input;
  return `${input}${digit}`;
}

export function inputDisplay(input: string): string {
  return input;
}
