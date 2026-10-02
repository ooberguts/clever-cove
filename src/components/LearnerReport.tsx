import { BarChart3, CalendarDays, Clock3, Minus, Target, TrendingDown, TrendingUp, Trophy } from "lucide-react";
import type { ReactNode } from "react";
import type { LearnerProfile } from "../domain/models";
import { buildLearnerReport, type TrendStatus } from "../reports/learnerReport";

export function LearnerReport({ learner }: { learner: LearnerProfile }) {
  const report = buildLearnerReport(learner);
  const practiced = report.games.filter((game) => game.sessions > 0 || game.attempts > 0 || game.completedRounds > 0);
  const trendCopy = describeTrend(report.trend.status, report.trend.changePoints);
  const TrendIcon = trendIcon(report.trend.status);

  return (
    <div className="learner-report">
      <section className="report-overview" aria-label={`${learner.displayName}'s progress overview`}>
        <ReportMetric icon={<Clock3 />} label="Practice sessions" value={String(report.totalSessions)} />
        <ReportMetric icon={<Target />} label="Questions answered" value={String(report.totalAttempts)} />
        <ReportMetric icon={<Trophy />} label="Overall accuracy" value={formatPercent(report.overallSuccessRate)} />
        <ReportMetric icon={<CalendarDays />} label="Active days · last 14" value={String(report.activeDays)} />
      </section>

      <section className={`report-card trend-card trend-${report.trend.status}`}>
        <div className="report-card-heading">
          <div className="report-heading-icon"><TrendIcon /></div>
          <div><span className="eyebrow">IMPROVEMENT OVER TIME</span><h3>{trendCopy.title}</h3><p>{trendCopy.detail}</p></div>
        </div>
        <div className="trend-comparison">
          <div><small>Previous 7 days</small><strong>{formatPercent(report.trend.previousRate)}</strong><span>{report.trend.previousAttempts} answers</span></div>
          <div className="trend-arrow" aria-hidden="true">→</div>
          <div><small>Recent 7 days</small><strong>{formatPercent(report.trend.currentRate)}</strong><span>{report.trend.currentAttempts} answers</span></div>
        </div>
        <div className="accuracy-chart" aria-label="Daily accuracy for the last 14 days">
          {report.recentDays.map((day, index) => {
            const height = day.successRate === null ? 4 : Math.max(12, Math.round(day.successRate * 100));
            const label = day.successRate === null
              ? `${formatDay(day.date)}: no answers`
              : `${formatDay(day.date)}: ${formatPercent(day.successRate)} across ${day.attempts} answers`;
            return (
              <div className={`accuracy-day ${index >= 7 ? "recent" : ""}`} key={day.date}>
                <div className="accuracy-bar-track"><span style={{ height: `${height}%` }} title={label} /></div>
                <small>{index === 0 || index === 7 || index === 13 ? formatShortDay(day.date) : ""}</small>
                <span className="sr-only">{label}</span>
              </div>
            );
          })}
        </div>
        <p className="report-method-note">Accuracy compares correct answers with attempts. A trend appears after at least 3 answers in each seven-day period.</p>
      </section>

      <section className="report-card">
        <div className="report-card-heading">
          <div className="report-heading-icon purple"><BarChart3 /></div>
          <div><span className="eyebrow">GAME ACTIVITY</span><h3>What {learner.displayName} plays</h3><p>Games are ordered by sessions, then answers.</p></div>
        </div>
        {practiced.length === 0 ? (
          <div className="report-empty"><BarChart3 /><strong>No practice recorded yet</strong><span>Play a game and the first totals will appear here.</span></div>
        ) : (
          <div className="game-report-list">
            {report.games.map((game) => {
              const isMostPlayed = report.mostPlayed?.gameId === game.gameId;
              const needsPractice = report.needsPractice.some((item) => item.gameId === game.gameId);
              return (
                <article className="game-report-row" key={game.gameId}>
                  <div className="game-report-title">
                    <span className={`report-subject subject-${game.subject}`}>{game.subject.replace("-", " ")}</span>
                    <strong>{game.title}</strong>
                    <small>{game.lastPlayedAt ? `Last played ${formatDateTime(game.lastPlayedAt)}` : "Not practiced yet"}</small>
                  </div>
                  <div className="game-report-stat"><strong>{game.sessions}</strong><small>sessions</small></div>
                  <div className="game-report-stat"><strong>{game.attempts}</strong><small>answers</small></div>
                  <div className="game-report-stat"><strong>{formatPercent(game.successRate)}</strong><small>accuracy</small></div>
                  <div className="game-report-badges">
                    {isMostPlayed && <span className="report-badge favorite"><Trophy /> Most played</span>}
                    {needsPractice && <span className="report-badge support"><Target /> More practice</span>}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="report-card">
        <div className="report-card-heading">
          <div className="report-heading-icon warm"><Target /></div>
          <div><span className="eyebrow">FOCUS AREAS</span><h3>Skills that may need more practice</h3><p>Shown only after at least 3 attempts and below 70% accuracy.</p></div>
        </div>
        {report.focusAreas.length === 0 ? (
          <div className="report-positive"><Trophy /><span><strong>No clear struggle area yet.</strong><small>More practice will make this report more useful.</small></span></div>
        ) : (
          <div className="focus-area-grid">
            {report.focusAreas.map((area) => (
              <article key={`${area.skillId}:${area.contentId}`}>
                <span>{area.skillLabel}</span>
                <strong>{area.contentLabel}</strong>
                <div><b>{formatPercent(area.successRate)}</b><small>{area.correct} correct of {area.attempts}</small></div>
              </article>
            ))}
          </div>
        )}
      </section>

      <div className="report-privacy-note">
        <Target /><span><strong>Private learning totals only.</strong> Reports never store typed answers, Student IDs, or the parent PIN. Daily improvement history begins with this report update.</span>
      </div>
    </div>
  );
}

function ReportMetric({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return <article className="report-metric"><div>{icon}</div><span><small>{label}</small><strong>{value}</strong></span></article>;
}

function formatPercent(rate: number | null): string {
  return rate === null ? "—" : `${Math.round(rate * 100)}%`;
}

function trendIcon(status: TrendStatus) {
  if (status === "improving") return TrendingUp;
  if (status === "needs-support") return TrendingDown;
  return Minus;
}

function describeTrend(status: TrendStatus, changePoints: number | null) {
  if (status === "improving") return { title: "Accuracy is improving", detail: `Up ${changePoints} percentage points compared with the previous seven days.` };
  if (status === "needs-support") return { title: "A little more support may help", detail: `Down ${Math.abs(changePoints ?? 0)} percentage points compared with the previous seven days.` };
  if (status === "steady") return { title: "Accuracy is staying steady", detail: "Recent accuracy is close to the previous seven days." };
  if (status === "no-recent-practice") return { title: "No recent answers yet", detail: "A new trend will appear after more practice." };
  return { title: "Building an improvement baseline", detail: "Keep practicing across several days to compare two full periods." };
}

function formatDay(date: string): string {
  return new Date(`${date}T12:00:00Z`).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function formatShortDay(date: string): string {
  return new Date(`${date}T12:00:00Z`).toLocaleDateString(undefined, { month: "numeric", day: "numeric" });
}

function formatDateTime(timestamp: string): string {
  return new Date(timestamp).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}
