import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, Delete, RotateCcw, Sparkles } from "lucide-react";
import type { AppServices } from "../../services";
import type { LearnerProfile } from "../../domain/models";
import { appendDigit, INITIAL_GAME_STATE, inputDisplay, KEYPAD_KEYS, type KeypadKey } from "./studentIdLogic";
import { STUDENT_ID_GAME_ID } from "./manifest";

interface StudentIdGameProps {
  learner: LearnerProfile;
  services: AppServices;
  onExit: () => void;
}

export function StudentIdGame({ learner, services, onExit }: StudentIdGameProps) {
  const [state, setState] = useState(INITIAL_GAME_STATE);
  const [busy, setBusy] = useState(false);
  const sessionStarted = useRef(false);

  useEffect(() => {
    if (sessionStarted.current) return;
    sessionStarted.current = true;
    void services.progress.startSession(learner.id, STUDENT_ID_GAME_ID);
  }, [learner.id, services]);

  const enter = useCallback(async () => {
    if (busy || !state.input) return;
    setBusy(true);
    const success = services.privateValues.matches(learner.id, "private.student_id", state.input);
    await services.progress.recordAttempt(learner.id, STUDENT_ID_GAME_ID, success);
    setState({ input: "", feedback: success ? "success" : "retry" });
    setBusy(false);
  }, [busy, learner.id, services, state.input]);

  const pressKey = useCallback(
    (key: KeypadKey) => {
      if (key === "CLEAR") {
        setState(INITIAL_GAME_STATE);
      } else if (key === "ENTER") {
        void enter();
      } else {
        setState((current) => ({ input: appendDigit(current.input, key), feedback: "idle" }));
      }
    },
    [enter],
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
      if (/^\d$/.test(event.key)) pressKey(event.key as KeypadKey);
      if (event.key === "Backspace" || event.key === "Escape") pressKey("CLEAR");
      if (event.key === "Enter") pressKey("ENTER");
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [pressKey]);

  return (
    <main className="game-page">
      <header className="game-header">
        <button className="icon-button" type="button" onClick={onExit} aria-label="Back to games">
          <ArrowLeft aria-hidden="true" />
        </button>
        <div>
          <span className="eyebrow">LIFE SKILLS</span>
          <h1>Student ID Practice</h1>
        </div>
        <div className="learner-chip" aria-label={`Playing as ${learner.displayName}`}>
          {learner.displayName.slice(0, 1).toUpperCase()}
        </div>
      </header>

      <section className="practice-card" aria-labelledby="game-prompt">
        <div className="practice-intro">
          <span className="step-pill">Practice round</span>
          <h2 id="game-prompt">Enter your student ID</h2>
          <p>Use the keypad just like you do at school.</p>
        </div>

        <div className={`entry-display ${state.feedback}`} aria-label={`${state.input.length} digits entered`}>
          <span className={state.input ? "entry-dots" : "entry-placeholder"}>
            {state.input ? inputDisplay(state.input) : "Your numbers will appear here"}
          </span>
          {state.input && <span className="digit-count">{state.input.length}/12</span>}
        </div>

        <div className="feedback-space" aria-live="polite" aria-atomic="true">
          {state.feedback === "success" && (
            <div className="feedback success-message">
              <Sparkles aria-hidden="true" />
              <div><strong>Correct! Nice job!</strong><span>You’re ready for another round.</span></div>
            </div>
          )}
          {state.feedback === "retry" && (
            <div className="feedback retry-message">
              <RotateCcw aria-hidden="true" />
              <div><strong>Not quite. Try again.</strong><span>Take your time—you’ve got this.</span></div>
            </div>
          )}
        </div>

        <div className="keypad" aria-label="Student ID numeric keypad">
          {KEYPAD_KEYS.map((key) => (
            <button
              key={key}
              type="button"
              className={`key key-${key.toLowerCase()}`}
              onClick={() => pressKey(key)}
              disabled={busy}
              aria-label={key === "CLEAR" ? "Clear all digits" : key === "ENTER" ? "Submit student ID" : `Number ${key}`}
            >
              {key === "CLEAR" && <Delete aria-hidden="true" />}
              <span>{key}</span>
            </button>
          ))}
        </div>
        <p className="keyboard-hint">Keyboard: number keys to type · Enter to submit · Backspace to clear</p>
      </section>
    </main>
  );
}
