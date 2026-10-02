import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, RotateCcw, Volume2 } from "lucide-react";
import type { LearnerProfile } from "../../../domain/models";
import type { AppServices } from "../../../services";
import { GameGoalProgress, GameMilestoneDialog } from "../../shared/GameMilestone";
import { useGameMilestone } from "../../shared/useGameMilestone";
import { createTrickyWordQuestion, type TrickyWordQuestion } from "./trickyWordLogic";
import { TRICKY_WORD_MATCH_GAME_ID, TRICKY_WORD_PROMPT_AUDIO_ID, TRICKY_WORD_SKILL_ID } from "./manifest";
import "../reading-games.css";

interface TrickyWordMatchGameProps {
  learner: LearnerProfile;
  services: AppServices;
  onExit: () => void;
}

type Feedback = "idle" | "retry" | "correct";

export function TrickyWordMatchGame({ learner, services, onExit }: TrickyWordMatchGameProps) {
  const groupId = services.learningPreferences.get(learner.id).trickyWordGroup;
  const makeQuestion = useCallback(() => createTrickyWordQuestion(groupId), [groupId]);
  const [question, setQuestion] = useState<TrickyWordQuestion>(makeQuestion);
  const [feedback, setFeedback] = useState<Feedback>("idle");
  const [wrongChoiceIds, setWrongChoiceIds] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const sessionStarted = useRef(false);
  const milestone = useGameMilestone(services.progress.get(learner.id, TRICKY_WORD_MATCH_GAME_ID).successes);

  const playWord = useCallback(() => {
    void services.audio.play(question.correct.audioId);
  }, [question.correct.audioId, services.audio]);

  useEffect(() => {
    if (!sessionStarted.current) {
      sessionStarted.current = true;
      void services.progress.startSession(learner.id, TRICKY_WORD_MATCH_GAME_ID);
    }
  }, [learner.id, services.progress]);

  useEffect(() => {
    playWord();
  }, [playWord]);

  async function choose(wordId: string) {
    if (busy || feedback === "correct" || wrongChoiceIds.includes(wordId)) return;
    const success = wordId === question.correct.id;
    setBusy(true);
    await services.progress.recordLearningAttempt(
      learner.id,
      TRICKY_WORD_MATCH_GAME_ID,
      TRICKY_WORD_SKILL_ID,
      question.correct.id,
      success,
    );
    if (success) {
      services.sounds.success();
      milestone.recordCorrect();
      setFeedback("correct");
    } else {
      services.sounds.retry();
      setWrongChoiceIds((current) => [...current, wordId]);
      setFeedback("retry");
    }
    setBusy(false);
  }

  function nextQuestion() {
    setQuestion(makeQuestion());
    setWrongChoiceIds([]);
    setFeedback("idle");
  }

  function keepPlaying() {
    milestone.continuePlaying();
    nextQuestion();
  }

  return (
    <main className="reading-game-page tricky-word-theme">
      <header className="reading-game-header">
        <button className="reading-icon-button" type="button" onClick={onExit} aria-label="Back to games">
          <ArrowLeft aria-hidden="true" />
        </button>
        <div>
          <span className="reading-eyebrow">READING</span>
          <h1>Tricky Word Match</h1>
        </div>
        <div className="reading-learner-chip" aria-label={`Playing as ${learner.displayName}`}>
          {learner.displayName.slice(0, 1).toUpperCase()}
        </div>
      </header>

      <GameGoalProgress corrects={milestone.corrects} />

      <section className="reading-quiz-card" aria-labelledby="tricky-word-prompt">
        <span className="reading-step-pill">Listen and choose</span>
        <h2 id="tricky-word-prompt">Which word did you hear?</h2>
        <div className="reading-audio-actions">
          <button className="reading-instruction-button" type="button" onClick={() => void services.audio.play(TRICKY_WORD_PROMPT_AUDIO_ID)}>
            <Volume2 aria-hidden="true" /> Hear the Question
          </button>
          <button className="reading-replay-button" type="button" onClick={playWord} aria-label="Replay spoken word">
            <Volume2 aria-hidden="true" /> Replay Word
          </button>
        </div>

        <div className="reading-choice-grid word-choices" aria-label="Word choices">
          {question.choices.map((word) => {
            const isWrong = wrongChoiceIds.includes(word.id);
            const isCorrect = feedback === "correct" && word.id === question.correct.id;
            return (
              <button
                key={word.id}
                type="button"
                className={`reading-answer-button word-answer ${isWrong ? "is-retry" : ""} ${isCorrect ? "is-correct" : ""}`}
                onClick={() => void choose(word.id)}
                disabled={busy || feedback === "correct" || isWrong}
                aria-label={`${word.text}${isWrong ? ", try another" : ""}${isCorrect ? ", correct" : ""}`}
              >
                {word.text}
              </button>
            );
          })}
        </div>

        <div className="reading-feedback" aria-live="polite" aria-atomic="true">
          {feedback === "idle" && <span>Tap the speaker whenever you want to hear the word again.</span>}
          {feedback === "retry" && <><RotateCcw aria-hidden="true" /><strong>Nice try! Hear the word again and choose another one.</strong></>}
          {feedback === "correct" && <><CheckCircle2 aria-hidden="true" /><strong>You found it! Wonderful reading!</strong></>}
        </div>

        {feedback === "correct" && !milestone.isCelebrating && (
          <button className="reading-next-button" type="button" onClick={nextQuestion}>
            Next Word <ArrowRight aria-hidden="true" />
          </button>
        )}
      </section>
      <GameMilestoneDialog open={milestone.isCelebrating} learnerName={learner.displayName} onKeepPlaying={keepPlaying} onChooseGame={onExit} />
    </main>
  );
}
