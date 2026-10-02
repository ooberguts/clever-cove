import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, Check, Delete, RotateCcw, Sparkles, Volume2, VolumeX } from "lucide-react";
import type { AppServices } from "../../services";
import type { LearnerProfile } from "../../domain/models";
import { appendDigit, INITIAL_GAME_STATE, KEYPAD_KEYS, type KeypadKey } from "./studentIdLogic";
import { STUDENT_ID_GAME_ID } from "./manifest";

interface StudentIdGameProps {
  learner: LearnerProfile;
  services: AppServices;
  onExit: () => void;
}

export function StudentIdGame({ learner, services, onExit }: StudentIdGameProps) {
  const [state, setState] = useState(INITIAL_GAME_STATE);
  const [busy, setBusy] = useState(false);
  const [muted, setMuted] = useState(false);
  const sessionStarted = useRef(false);
  const practiceId = services.privateValues.getForGuidedPractice(learner.id, "private.student_id");
  const digitStates = state.input.split("").map((digit, index) => digit === practiceId[index]);
  const needsClear = digitStates.includes(false);

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
    if (success) {
      services.sounds.success(muted);
      setState({ input: "", feedback: "success" });
    } else {
      services.sounds.retry(muted);
      setState((current) => ({ ...current, feedback: "retry" }));
    }
    setBusy(false);
  }, [busy, learner.id, muted, services, state.input]);

  const pressKey = useCallback(
    (key: KeypadKey) => {
      if (key === "CLEAR") {
        services.sounds.clear(muted);
        setState(INITIAL_GAME_STATE);
      } else if (key === "ENTER") {
        void enter();
      } else {
        const nextInput = appendDigit(state.input, key);
        if (nextInput !== state.input) {
          services.sounds.digit(key === practiceId[state.input.length] ? "correct" : "incorrect", muted);
          setState({ input: nextInput, feedback: "idle" });
        }
      }
    },
    [enter, muted, practiceId, services.sounds, state.input],
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
        <div className="game-header-actions">
          <button className="icon-button sound-button" type="button" onClick={() => setMuted((value) => !value)} aria-label={muted ? "Turn sounds on" : "Mute sounds"}>
            {muted ? <VolumeX aria-hidden="true" /> : <Volume2 aria-hidden="true" />}
          </button>
          <div className="learner-chip" aria-label={`Playing as ${learner.displayName}`}>
            {learner.displayName.slice(0, 1).toUpperCase()}
          </div>
        </div>
      </header>

      <section className="practice-card" aria-labelledby="game-prompt">
        <div className="practice-intro">
          <span className="step-pill">Practice round</span>
          <h2 id="game-prompt">Copy your student ID</h2>
          <p>Look at each number, then find it on the keypad.</p>
        </div>

        <div className="student-id-reference">
          <span>Your student ID</span>
          <strong aria-label={`Student ID to practice: ${practiceId.split("").join(" ")}`}>{practiceId}</strong>
        </div>

        <div className={`entry-display guided ${state.feedback} ${needsClear ? "needs-clear" : ""}`} aria-label={`${state.input.length} digits entered`}>
          <span className="entry-label">Your turn</span>
          <div className="guided-digits">
            {Array.from({ length: Math.max(practiceId.length, state.input.length) }, (_, index) => {
              const digit = state.input[index];
              const isCorrect = digit ? digitStates[index] : undefined;
              return (
                <span
                  key={index}
                  className={`guided-digit ${isCorrect === true ? "correct" : ""} ${isCorrect === false ? "incorrect" : ""}`}
                  aria-label={digit ? `Entered digit ${index + 1}: ${digit}, ${isCorrect ? "correct" : "needs clearing"}` : `Digit ${index + 1} empty`}
                >
                  {digit || ""}
                  {isCorrect && <Check aria-hidden="true" />}
                </span>
              );
            })}
          </div>
          {!state.input && <span className="entry-placeholder">Tap the first number to begin</span>}
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
              <div>
                <strong>{needsClear ? "Oops! Press CLEAR." : "Almost there. Keep going!"}</strong>
                <span>{needsClear ? "Then start again with the number above." : "Look at the number above for help."}</span>
              </div>
            </div>
          )}
          {state.feedback === "idle" && needsClear && (
            <div className="feedback retry-message">
              <RotateCcw aria-hidden="true" />
              <div><strong>This number needs fixing.</strong><span>Press the glowing CLEAR button and try again.</span></div>
            </div>
          )}
        </div>

        <div className="keypad" aria-label="Student ID numeric keypad">
          {KEYPAD_KEYS.map((key) => (
            <button
              key={key}
              type="button"
              className={`key key-${key.toLowerCase()} ${key === "CLEAR" && needsClear ? "needs-attention" : ""}`}
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
