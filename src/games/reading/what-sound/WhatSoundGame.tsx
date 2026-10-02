import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, RotateCcw, Volume2 } from "lucide-react";
import type { LearnerProfile } from "../../../domain/models";
import { GameGoalProgress, GameMilestoneDialog } from "../../shared/GameMilestone";
import { useGameMilestone } from "../../shared/useGameMilestone";
import type { AppServices } from "../../../services";
import { createWhatSoundQuestion, type WhatSoundQuestion } from "./whatSoundLogic";
import { WHAT_SOUND_GAME_ID, WHAT_SOUND_SKILL_ID } from "./manifest";
import "../reading-games.css";

interface WhatSoundGameProps {
  learner: LearnerProfile;
  services: AppServices;
  onExit: () => void;
}

type Feedback = "idle" | "retry" | "correct";

export function WhatSoundGame({ learner, services, onExit }: WhatSoundGameProps) {
  const focusIds = services.learningPreferences.get(learner.id).letterFocusIds;
  const makeQuestion = useCallback(() => createWhatSoundQuestion(focusIds), [focusIds]);
  const [question, setQuestion] = useState<WhatSoundQuestion>(makeQuestion);
  const [feedback, setFeedback] = useState<Feedback>("idle");
  const [wrongChoiceIds, setWrongChoiceIds] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const sessionStarted = useRef(false);
  const milestone = useGameMilestone(services.progress.get(learner.id, WHAT_SOUND_GAME_ID).successes);

  const playLetterName = useCallback(() => {
    void services.audio.play(question.correct.letterNameAudioId);
  }, [question.correct.letterNameAudioId, services.audio]);

  useEffect(() => {
    if (!sessionStarted.current) {
      sessionStarted.current = true;
      void services.progress.startSession(learner.id, WHAT_SOUND_GAME_ID);
    }
  }, [learner.id, services.progress]);

  useEffect(() => {
    playLetterName();
  }, [playLetterName]);

  async function choose(letterId: string) {
    if (busy || feedback === "correct" || wrongChoiceIds.includes(letterId)) return;
    const success = letterId === question.correct.id;
    setBusy(true);
    await services.progress.recordLearningAttempt(
      learner.id,
      WHAT_SOUND_GAME_ID,
      WHAT_SOUND_SKILL_ID,
      question.correct.id,
      success,
    );
    if (success) {
      services.sounds.success();
      milestone.recordCorrect();
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

  function keepPlaying() {
    milestone.continuePlaying();
    nextQuestion();
  }

  return (
    <main className="reading-game-page what-sound-theme">
      <header className="reading-game-header">
        <button className="reading-icon-button" type="button" onClick={onExit} aria-label="Back to games"><ArrowLeft aria-hidden="true" /></button>
        <div><span className="reading-eyebrow">READING · LETTER SOUNDS</span><h1>What Sound?</h1></div>
        <div className="reading-learner-chip" aria-label={`Playing as ${learner.displayName}`}>{learner.displayName.slice(0, 1).toUpperCase()}</div>
      </header>

      <GameGoalProgress corrects={milestone.corrects} />

      <section className="reading-quiz-card" aria-labelledby="what-sound-prompt">
        <span className="reading-step-pill">Letter name or letter sound?</span>
        <h2 id="what-sound-prompt">What sound does this letter make?</h2>
        <div className="what-sound-letter" aria-label={`Uppercase ${question.correct.uppercase}, lowercase ${question.correct.lowercase}`}>
          <strong>{question.correct.uppercase}</strong><span>{question.correct.lowercase}</span>
        </div>
        <button className="reading-instruction-button what-sound-name-button" type="button" onClick={playLetterName}>
          <Volume2 aria-hidden="true" /> Hear its name: {question.correct.uppercase}
        </button>
        <p className="what-sound-explainer">Its name is <strong>{question.correct.uppercase}</strong>. Now listen and choose the sound it says.</p>

        <div className="sound-choice-grid" aria-label="Sound choices">
          {question.choices.map((letter, index) => {
            const isWrong = wrongChoiceIds.includes(letter.id);
            const isCorrect = feedback === "correct" && letter.id === question.correct.id;
            return (
              <article className={`sound-choice ${isWrong ? "is-retry" : ""} ${isCorrect ? "is-correct" : ""}`} key={letter.id}>
                <span>Sound {index + 1}</span>
                <button className="sound-listen" type="button" onClick={() => void services.audio.play(letter.phonemeAudioId)} aria-label={`Hear sound ${index + 1}`}>
                  <Volume2 aria-hidden="true" />
                </button>
                <button className="sound-select" type="button" onClick={() => void choose(letter.id)} disabled={busy || feedback === "correct" || isWrong} aria-label={`Choose sound ${index + 1}${isWrong ? ", try another" : ""}${isCorrect ? ", correct" : ""}`}>
                  {isCorrect ? "That’s it!" : isWrong ? "Try another" : "Choose"}
                </button>
              </article>
            );
          })}
        </div>

        <div className="reading-feedback" aria-live="polite" aria-atomic="true">
          {feedback === "idle" && <span>Tap each speaker as many times as you need.</span>}
          {feedback === "retry" && <><RotateCcw aria-hidden="true" /><strong>Good listening! Try another sound.</strong></>}
          {feedback === "correct" && <><CheckCircle2 aria-hidden="true" /><strong>Yes! {question.correct.uppercase} makes that sound!</strong></>}
        </div>

        {feedback === "correct" && !milestone.isCelebrating && (
          <button className="reading-next-button" type="button" onClick={nextQuestion}>Next Letter <ArrowRight aria-hidden="true" /></button>
        )}
      </section>

      <GameMilestoneDialog open={milestone.isCelebrating} learnerName={learner.displayName} onKeepPlaying={keepPlaying} onChooseGame={onExit} />
    </main>
  );
}
