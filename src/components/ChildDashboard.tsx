import { ArrowRight, BookOpen, Calculator, LockKeyhole, Shapes, Star } from "lucide-react";
import type { LearnerProfile } from "../domain/models";
import type { AppServices } from "../services";
import { gameRegistry, missingGameSettings } from "../games/registry";

interface ChildDashboardProps {
  learners: LearnerProfile[];
  activeLearnerId: string;
  services: AppServices;
  onSelectLearner: (id: string) => void;
  onLaunch: (gameId: string) => void;
}

export function ChildDashboard({ learners, activeLearnerId, services, onSelectLearner, onLaunch }: ChildDashboardProps) {
  const learner = learners.find((item) => item.id === activeLearnerId) ?? learners[0];
  if (!learner) return null;
  const availableGames = gameRegistry.filter((game) => game.supportedGrades.includes(learner.grade));

  return (
    <main className="dashboard">
      <section className="welcome-row">
        <div>
          <span className="eyebrow">READY WHEN YOU ARE</span>
          <h1>Hi, {learner.displayName}! <span aria-hidden="true">👋</span></h1>
          <p>Pick a game and practice a skill.</p>
        </div>
        <div className="profile-picker">
          <label htmlFor="learner-picker">Learning as</label>
          <select id="learner-picker" value={learner.id} onChange={(event) => onSelectLearner(event.target.value)}>
            {learners.map((profile) => <option key={profile.id} value={profile.id}>{profile.displayName} · Grade {profile.grade}</option>)}
          </select>
        </div>
      </section>

      <section className="game-section" aria-labelledby="games-title">
        <div className="section-heading">
          <div><span className="eyebrow">YOUR GAMES</span><h2 id="games-title">Choose your next adventure</h2></div>
          <span className="game-count">{availableGames.length} game{availableGames.length === 1 ? "" : "s"} ready</span>
        </div>
        <div className="game-grid">
          {availableGames.map((game) => {
            const missing = missingGameSettings(game, services.privateValues.configuredKeys(learner.id));
            const locked = missing.length > 0;
            const progress = services.progress.get(learner.id, game.id);
            return (
              <article className={`game-card ${locked ? "locked" : ""}`} key={game.id}>
                <div className={`game-card-art subject-${game.subject}`} style={{ backgroundColor: game.accent }}>
                  <GameCardArt subject={game.subject} />
                  <div className="art-star"><Star fill="currentColor" /></div>
                  <div className="art-shape"><Shapes /></div>
                </div>
                <div className="game-card-body">
                  <span className="subject-badge">{game.subject.replace("-", " ").toUpperCase()}</span>
                  <h3>{game.title}</h3>
                  <p>{game.description}</p>
                  {locked ? (
                    <div className="locked-label"><LockKeyhole aria-hidden="true" /><span><strong>Parent setup required</strong><small>Ask a parent to add your Student ID</small></span></div>
                  ) : (
                    <>
                      {progress.sessions > 0 && <p className="progress-note">{progress.successes} successful round{progress.successes === 1 ? "" : "s"}</p>}
                      <button className="play-button" type="button" onClick={() => onLaunch(game.id)}>
                        Practice now <ArrowRight aria-hidden="true" />
                      </button>
                    </>
                  )}
                </div>
              </article>
            );
          })}
          <article className="coming-card"><div className="coming-icon">+</div><h3>More games coming soon</h3><p>New adventures will appear right here.</p></article>
        </div>
      </section>
    </main>
  );
}

function GameCardArt({ subject }: { subject: string }) {
  if (subject === "math") return <div className="learning-card-art math-art" aria-hidden="true"><Calculator /><span>1</span><span>2</span><span>3</span></div>;
  if (subject === "reading") return <div className="learning-card-art reading-art" aria-hidden="true"><BookOpen /><strong>Aa</strong><small>the</small></div>;
  return <div className="mini-pad" aria-hidden="true"><span>7</span><span>8</span><span>9</span><span>4</span><span>5</span><span>6</span><span>1</span><span>2</span><span>3</span><span>C</span><span>0</span><span>✓</span></div>;
}
