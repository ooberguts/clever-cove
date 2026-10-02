import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, RotateCcw, Volume2 } from "lucide-react";
import type { LearnerProfile } from "../../../domain/models";
import type { AppServices } from "../../../services";
import { createLetterSoundQuestion, type LetterSoundQuestion } from "./letterSoundLogic";
import { LETTER_SOUND_MATCH_GAME_ID, LETTER_SOUND_PROMPT_AUDIO_ID, LETTER_SOUND_SKILL_ID } from "./manifest";
import "../reading-games.css";

interface LetterSoundMatchGameProps {
  learner: LearnerProfile;
  services: AppServices;
  onExit: () => void;
}

type Feedback = "idle" | "retry" | "correct";

export function LetterSoundMatchGame({ learner, services, onExit }: LetterSoundMatchGameProps) {
  const focusIds = services.learningPreferences.get(learner.id).letterFocusIds;
  const makeQuestion = useCallback(() => createLetterSoundQuestion(focusIds), [focusIds]);
  const [question, setQuestion] = useState<LetterSoundQuestion>(makeQuestion);
  const [feedback, setFeedback] = useState<Feedback>("idle");
  const [wrongChoiceIds, setWrongChoiceIds] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const sessionStarted = useRef(false);

  const playSound = useCallback(() => {
    void services.audio.play(question.correct.phonemeAudioId);
  }, [question.correct.phonemeAudioId, services.audio]);

  useEffect(() => {
    if (!sessionStarted.current) {
      sessionStarted.current = true;
      void services.progress.startSession(learner.id, LETTER_SOUND_MATCH_GAME_ID);
    }
  }, [learner.id, services.progress]);

  useEffect(() => {
    playSound();
  }, [playSound]);

  async function choose(letterId: string) {
    if (busy || feedback === "correct" || wrongChoiceIds.includes(letterId)) return;
    const success = letterId === question.correct.id;
    setBusy(true);
    await services.progress.recordLearningAttempt(
      learner.id,
      LETTER_SOUND_MATCH_GAME_ID,
      LETTER_SOUND_SKILL_ID,
      question.correct.id,
      success,
    );
    if (success) {
      services.sounds.success();
      setFeedback("correct");
    } else {
      services.sounds.retry();
      setWrongChoiceIds((current) => [...current, letterId]);
      setFeedback("retry");
    }
    setBusy(false);
  }

  function nextQuestion() {
    setQuestion(makeQuestion());
    setWrongChoiceIds([]);
    setFeedback("idle");
  }

  return (
    <main className="reading-game-page">
      <header className="reading-game-header">
        <button className="reading-icon-button" type="button" onClick={onExit} aria-label="Back to games">
          <ArrowLeft aria-hidden="true" />
        </button>
        <div>
          <span className="reading-eyebrow">READING</span>
          <h1>Letter Sound Match</h1>
        </div>
        <div className="reading-learner-chip" aria-label={`Playing as ${learner.displayName}`}>
          {learner.displayName.slice(0, 1).toUpperCase()}
        </div>
      </header>

      <section className="reading-quiz-card" aria-labelledby="letter-sound-prompt">
        <span className="reading-step-pill">Listen and choose</span>
        <h2 id="letter-sound-prompt">Which letter makes this sound?</h2>
        <div className="reading-audio-actions">
          <button className="reading-instruction-button" type="button" onClick={() => void services.audio.play(LETTER_SOUND_PROMPT_AUDIO_ID)}>
            <Volume2 aria-hidden="true" /> Hear the Question
          </button>
          <button className="reading-replay-button" type="button" onClick={playSound} aria-label="Replay letter sound">
            <Volume2 aria-hidden="true" /> Replay Sound
          </button>
        </div>

        <div className="reading-choice-grid" aria-label="Letter choices">
          {question.choices.map((letter) => {
            const isWrong = wrongChoiceIds.includes(letter.id);
            const isCorrect = feedback === "correct" && letter.id === question.correct.id;
            return (
              <button
                key={letter.id}
                type="button"
                className={`reading-answer-button ${isWrong ? "is-retry" : ""} ${isCorrect ? "is-correct" : ""}`}
                onClick={() => void choose(letter.id)}
                disabled={busy || feedback === "correct" || isWrong}
                aria-label={`Letter ${letter.uppercase}, lowercase ${letter.lowercase}${isWrong ? ", try another" : ""}${isCorrect ? ", correct" : ""}`}
              >
                {letter.display}
              </button>
            );
          })}
        </div>

        <div className="reading-feedback" aria-live="polite" aria-atomic="true">
          {feedback === "idle" && <span>Tap the speaker whenever you want to hear it again.</span>}
          {feedback === "retry" && <><RotateCcw aria-hidden="true" /><strong>Good try! Listen again and choose another letter.</strong></>}
          {feedback === "correct" && <><CheckCircle2 aria-hidden="true" /><strong>That’s right! Great listening!</strong></>}
        </div>

        {feedback === "correct" && (
          <button className="reading-next-button" type="button" onClick={nextQuestion}>
            Next Sound <ArrowRight aria-hidden="true" />
          </button>
        )}
      </section>
    </main>
  );
}
