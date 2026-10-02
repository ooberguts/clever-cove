import { useCallback, useRef, useState } from "react";

export const CORRECTS_PER_MILESTONE = 10;

export function correctsTowardMilestone(totalSuccesses: number): number {
  return Math.max(0, totalSuccesses) % CORRECTS_PER_MILESTONE;
}

export function useGameMilestone(totalSuccesses: number) {
  const initial = correctsTowardMilestone(totalSuccesses);
  const correctsRef = useRef(initial);
  const [corrects, setCorrects] = useState(initial);
  const [isCelebrating, setIsCelebrating] = useState(false);

  const recordCorrect = useCallback(() => {
    const next = Math.min(CORRECTS_PER_MILESTONE, correctsRef.current + 1);
    correctsRef.current = next;
    setCorrects(next);
    if (next === CORRECTS_PER_MILESTONE) setIsCelebrating(true);
    return next === CORRECTS_PER_MILESTONE;
  }, []);

  const continuePlaying = useCallback(() => {
    correctsRef.current = 0;
    setCorrects(0);
    setIsCelebrating(false);
  }, []);

  return { corrects, isCelebrating, recordCorrect, continuePlaying };
}
