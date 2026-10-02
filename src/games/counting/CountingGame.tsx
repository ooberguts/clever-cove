import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Check, Ear, ListOrdered, RotateCcw, Sparkles, Volume2 } from "lucide-react";
import { getNumbersThrough, type NumberContent } from "../../content";
import type { LearnerProfile } from "../../domain/models";
import type { AudioService } from "../../services/audioService";
import type { LearningPreferencesService } from "../../services/learningPreferencesService";
import type { ProgressService } from "../../services/progressService";
import { createListeningQuestion, createSequenceQuestion } from "./countingLogic";
import { COUNTING_GAME_ID, COUNTING_SKILL_IDS, countingRangeSkill } from "./manifest";
import "./counting.css";

type CountingMode = "sequence" | "listening" | "count-along";
type QuizQuestion = ReturnType<typeof createSequenceQuestion> | ReturnType<typeof createListeningQuestion>;

interface CountingServices {
  audio: Pick<AudioService, "play">;
  learningPreferences: Pick<LearningPreferencesService, "get">;
  progress: Pick<ProgressService, "startSession" | "recordLearningAttempt" | "recordPracticeCompletion">;
}

interface CountingGameProps {
  learner: LearnerProfile;
  services: CountingServices;
  onExit: () => void;
}

const MODE_DETAILS = [
  { id: "sequence" as const, title: "What comes next?", description: "Find the next number.", icon: ListOrdered },
  { id: "listening" as const, title: "Hear the number", description: "Listen, then pick the number.", icon: Ear },
  { id: "count-along" as const, title: "Count along", description: "Tap the numbers from 1 up.", icon: Sparkles },
];

const PROMPT_AUDIO_IDS: Record<CountingMode, string> = {
  sequence: "prompt.counting.what-comes-next",
  listening: "prompt.counting.hear-the-number",
  "count-along": "prompt.counting.count-along",
};

function QuestionChoices({
  question,
  answered,
  wrongChoices,
  onChoose,
}: {
  question: QuizQuestion;
  answered: boolean;
  wrongChoices: ReadonlySet<string>;
  onChoose: (choice: NumberContent) => void;
}) {
  return (
    <div className="counting-choices" aria-label="Answer choices">
      {question.choices.map((choice) => {
        const isCorrect = answered && choice.id === question.answer.id;
        const isWrong = wrongChoices.has(choice.id);
        return (
          <button
            key={choice.id}
            className={`counting-choice ${isCorrect ? "is-correct" : ""} ${isWrong ? "is-retry" : ""}`}
            type="button"
            onClick={() => onChoose(choice)}
            disabled={answered || isWrong}
            aria-label={`Number ${choice.display}${isCorrect ? ", correct" : isWrong ? ", try another" : ""}`}
          >
            {choice.display}
            {isCorrect && <Check aria-hidden="true" />}
          </button>
        );
      })}
    </div>
  );
}

export function CountingGame({ learner, services, onExit }: CountingGameProps) {
  const maximum = services.learningPreferences.get(learner.id).countingMaximum;
  const numbers = useMemo(() => getNumbersThrough(maximum), [maximum]);
  const [mode, setMode] = useState<CountingMode | null>(null);
  const [question, setQuestion] = useState<QuizQuestion>(() => createSequenceQuestion(maximum));
  const [answered, setAnswered] = useState(false);
  const [wrongChoices, setWrongChoices] = useState<Set<string>>(new Set());
  const [selectedCount, setSelectedCount] = useState<number | null>(null);
  const [nextCount, setNextCount] = useState(1);
  const [countComplete, setCountComplete] = useState(false);
  const sessionStarted = useRef(false);

  useEffect(() => {
    if (sessionStarted.current) return;
    sessionStarted.current = true;
    void services.progress.startSession(learner.id, COUNTING_GAME_ID);
  }, [learner.id, services.progress]);

  const newQuestion = useCallback((nextMode: Exclude<CountingMode, "count-along">) => {
    setQuestion(nextMode === "sequence" ? createSequenceQuestion(maximum) : createListeningQuestion(maximum));
    setAnswered(false);
    setWrongChoices(new Set());
  }, [maximum]);

  const chooseMode = (nextMode: CountingMode) => {
    setMode(nextMode);
    setSelectedCount(null);
    setNextCount(1);
    setCountComplete(false);
    if (nextMode !== "count-along") {
      const nextQuestion = nextMode === "sequence" ? createSequenceQuestion(maximum) : createListeningQuestion(maximum);
      setQuestion(nextQuestion);
      setAnswered(false);
      setWrongChoices(new Set());
      if (nextMode === "listening") void services.audio.play(nextQuestion.answer.audioId);
    }
  };

  const chooseAnswer = async (choice: NumberContent) => {
    if (answered || wrongChoices.has(choice.id)) return;
    const success = choice.id === question.answer.id;
    const skillId = question.kind === "sequence" ? COUNTING_SKILL_IDS.sequence : COUNTING_SKILL_IDS.recognition;
    await services.progress.recordLearningAttempt(learner.id, COUNTING_GAME_ID, skillId, question.answer.id, success);
    if (success) {
      setAnswered(true);
      void services.audio.play(question.answer.audioId);
    } else {
      setWrongChoices((current) => new Set(current).add(choice.id));
    }
  };

  const chooseCountNumber = async (number: NumberContent) => {
    setSelectedCount(number.value);
    void services.audio.play(number.audioId);
    if (number.value === nextCount) setNextCount((current) => Math.min(maximum + 1, current + 1));
    if (number.value === maximum && nextCount === maximum && !countComplete) {
      setCountComplete(true);
      await services.progress.recordPracticeCompletion(learner.id, COUNTING_GAME_ID);
    }
  };

  const replay = () => {
    if (mode === "listening") void services.audio.play(question.answer.audioId);
    else if (mode) void services.audio.play(PROMPT_AUDIO_IDS[mode]);
  };

  return (
    <main className="game-page counting-game">
      <header className="game-header">
        <button className="icon-button" type="button" onClick={mode ? () => setMode(null) : onExit} aria-label={mode ? "Back to counting activities" : "Back to games"}>
          <ArrowLeft aria-hidden="true" />
        </button>
        <div>
          <span className="eyebrow">MATH · COUNT TO {maximum}</span>
          <h1>Counting Practice</h1>
        </div>
        <div className="learner-chip" aria-label={`Playing as ${learner.displayName}`}>
          {learner.displayName.slice(0, 1).toUpperCase()}
        </div>
      </header>

      {!mode && (
        <section className="counting-card counting-mode-picker" aria-labelledby="counting-mode-title">
          <div className="counting-intro">
            <span aria-hidden="true">🔢</span>
            <h2 id="counting-mode-title">How do you want to count?</h2>
            <p>Pick a counting game.</p>
          </div>
          <div className="counting-modes">
            {MODE_DETAILS.map(({ id, title, description, icon: Icon }) => (
              <button key={id} type="button" className="counting-mode-button" onClick={() => chooseMode(id)}>
                <span className="counting-mode-icon" aria-hidden="true"><Icon /></span>
                <span><strong>{title}</strong><small>{description}</small></span>
              </button>
            ))}
          </div>
        </section>
      )}

      {mode && mode !== "count-along" && (
        <section className="counting-card" aria-labelledby="counting-prompt">
          <div className="counting-question-heading">
            <div>
              <span className="step-pill">Your turn</span>
              <h2 id="counting-prompt">{mode === "sequence" ? "What comes next?" : "Which number did you hear?"}</h2>
            </div>
            <button className="counting-listen-button" type="button" onClick={replay} aria-label={mode === "listening" ? "Replay the number" : "Hear the instructions"}>
              <Volume2 aria-hidden="true" /><span>{mode === "listening" ? "Replay" : "Listen"}</span>
            </button>
          </div>

          {question.kind === "sequence" ? (
            <div className="counting-sequence" aria-label={`${question.sequence.map((item) => item.display).join(", ")}, what comes next?`}>
              {question.sequence.map((item) => <span key={item.id}>{item.display}</span>)}
              <span className="counting-mystery">?</span>
            </div>
          ) : (
            <button className="counting-big-speaker" type="button" onClick={replay} aria-label="Replay the number"><Volume2 aria-hidden="true" /></button>
          )}

          <QuestionChoices question={question} answered={answered} wrongChoices={wrongChoices} onChoose={(choice) => void chooseAnswer(choice)} />

          <div className="counting-feedback" aria-live="polite" aria-atomic="true">
            {answered && <><Sparkles aria-hidden="true" /><strong>Yes! It’s {question.answer.display}!</strong></>}
            {!answered && wrongChoices.size > 0 && <><RotateCcw aria-hidden="true" /><strong>Good try! Pick another one.</strong></>}
          </div>
          {answered && (
            <button className="counting-next-button" type="button" onClick={() => newQuestion(mode)}>Next number</button>
          )}
        </section>
      )}

      {mode === "count-along" && (
        <section className="counting-card counting-along" aria-labelledby="count-along-title">
          <div className="counting-question-heading">
            <div>
              <span className="step-pill">Count to {maximum}</span>
              <h2 id="count-along-title">Tap {nextCount <= maximum ? nextCount : "any number"}</h2>
            </div>
            <button className="counting-listen-button" type="button" onClick={replay} aria-label="Hear the instructions"><Volume2 aria-hidden="true" /><span>Listen</span></button>
          </div>
          <p>Start at 1 and count all the way up. You can tap any number to hear it.</p>
          <div className="counting-number-grid" aria-label={`Numbers 1 through ${maximum}`}>
            {numbers.map((number) => (
              <button
                key={number.id}
                type="button"
                className={`${selectedCount === number.value ? "is-selected" : ""} ${number.value < nextCount ? "is-counted" : ""}`}
                onClick={() => void chooseCountNumber(number)}
                aria-pressed={selectedCount === number.value}
                aria-label={`Number ${number.display}${number.value < nextCount ? ", counted" : ""}`}
              >
                {number.display}
              </button>
            ))}
          </div>
          <div className="counting-feedback" aria-live="polite">
            {countComplete && <><Sparkles aria-hidden="true" /><strong>You counted to {maximum}! Wonderful!</strong></>}
          </div>
          <span className="counting-skill-label">Practicing {countingRangeSkill(maximum)}</span>
        </section>
      )}
    </main>
  );
}
