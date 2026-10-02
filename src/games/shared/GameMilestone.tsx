import { ArrowRight, Gamepad2, Sparkles, Trophy } from "lucide-react";
import { CORRECTS_PER_MILESTONE } from "./useGameMilestone";
import "./game-milestone.css";

export function GameGoalProgress({ corrects }: { corrects: number }) {
  const safeCorrects = Math.max(0, Math.min(CORRECTS_PER_MILESTONE, corrects));
  return (
    <section className="game-goal" aria-label={`${safeCorrects} of ${CORRECTS_PER_MILESTONE} correct answers toward the celebration`}>
      <div className="game-goal-copy">
        <span><Trophy aria-hidden="true" /> Celebration goal</span>
        <strong>{safeCorrects} / {CORRECTS_PER_MILESTONE} correct</strong>
      </div>
      <div className="game-goal-track" role="progressbar" aria-valuemin={0} aria-valuemax={CORRECTS_PER_MILESTONE} aria-valuenow={safeCorrects}>
        <span style={{ width: `${safeCorrects * 10}%` }} />
      </div>
      <div className="game-goal-dots" aria-hidden="true">
        {Array.from({ length: CORRECTS_PER_MILESTONE }, (_, index) => <i className={index < safeCorrects ? "filled" : ""} key={index} />)}
      </div>
    </section>
  );
}

export function GameMilestoneDialog({
  open,
  learnerName,
  onKeepPlaying,
  onChooseGame,
}: {
  open: boolean;
  learnerName: string;
  onKeepPlaying: () => void;
  onChooseGame: () => void;
}) {
  if (!open) return null;
  return (
    <div className="milestone-backdrop">
      <section className="milestone-dialog" role="dialog" aria-modal="true" aria-labelledby="milestone-title" aria-describedby="milestone-description">
        <div className="milestone-stars" aria-hidden="true">⭐ ✨ ⭐</div>
        <div className="milestone-trophy"><Trophy aria-hidden="true" /></div>
        <span className="milestone-kicker">TEN CORRECT!</span>
        <h2 id="milestone-title">Amazing work, {learnerName}!</h2>
        <p id="milestone-description">You filled the whole bar. What would you like to do next?</p>
        <div className="milestone-actions">
          <button className="milestone-keep" type="button" onClick={onKeepPlaying} autoFocus>
            <Sparkles aria-hidden="true" /> Keep playing <ArrowRight aria-hidden="true" />
          </button>
          <button className="milestone-choose" type="button" onClick={onChooseGame}>
            <Gamepad2 aria-hidden="true" /> Choose a new game
          </button>
        </div>
      </section>
    </div>
  );
}
