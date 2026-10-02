import { getLetterContent, getNumberContent, getTrickyWordContent } from "../content";
import type { GameProgress, LearnerProfile, LearningContentProgress } from "../domain/models";
import { gameRegistry } from "../games/registry";

export type TrendStatus = "improving" | "steady" | "needs-support" | "building-baseline" | "no-recent-practice";

export interface ReportGameMetric {
  gameId: string;
  title: string;
  subject: string;
  sessions: number;
  attempts: number;
  successes: number;
  completedRounds: number;
  successRate: number | null;
  lastPlayedAt?: string;
}

export interface ReportFocusArea {
  skillId: string;
  skillLabel: string;
  contentId: string;
  contentLabel: string;
  attempts: number;
  correct: number;
  successRate: number;
}

export interface ReportDay {
  date: string;
  attempts: number;
  successes: number;
  sessions: number;
  successRate: number | null;
}

export interface LearnerReportData {
  games: ReportGameMetric[];
  mostPlayed?: ReportGameMetric;
  needsPractice: ReportGameMetric[];
  focusAreas: ReportFocusArea[];
  totalSessions: number;
  totalAttempts: number;
  totalSuccesses: number;
  overallSuccessRate: number | null;
  activeDays: number;
  recentDays: ReportDay[];
  trend: {
    status: TrendStatus;
    currentAttempts: number;
    previousAttempts: number;
    currentRate: number | null;
    previousRate: number | null;
    changePoints: number | null;
  };
}

const MIN_TREND_ATTEMPTS = 3;
const STRUGGLE_THRESHOLD = 0.7;

export function buildLearnerReport(learner: LearnerProfile, now = new Date()): LearnerReportData {
  const games = gameRegistry
    .filter((game) => game.supportedGrades.includes(learner.grade) || Boolean(learner.progress[game.id]))
    .map((game) => toGameMetric(game.id, game.title, game.subject, learner.progress[game.id]))
    .sort((a, b) => b.sessions - a.sessions || b.attempts - a.attempts || a.title.localeCompare(b.title));

  const practicedGames = games.filter((game) => game.sessions > 0 || game.attempts > 0 || game.completedRounds > 0);
  const mostPlayed = practicedGames[0];
  const needsPractice = games
    .filter((game) => game.attempts >= MIN_TREND_ATTEMPTS && (game.successRate ?? 1) < STRUGGLE_THRESHOLD)
    .sort((a, b) => (a.successRate ?? 1) - (b.successRate ?? 1));
  const focusAreas = Object.values(learner.learningProgress)
    .filter((progress) => progress.attempts >= MIN_TREND_ATTEMPTS && progress.correct / progress.attempts < STRUGGLE_THRESHOLD)
    .sort((a, b) => a.correct / a.attempts - b.correct / b.attempts || b.attempts - a.attempts)
    .slice(0, 6)
    .map(toFocusArea);

  const recentDays = lastDateKeys(14, now).map((date) => aggregateDay(date, learner.progress));
  const previous = totalDays(recentDays.slice(0, 7));
  const current = totalDays(recentDays.slice(7));
  const currentRate = rate(current.successes, current.attempts);
  const previousRate = rate(previous.successes, previous.attempts);
  const hasComparison = current.attempts >= MIN_TREND_ATTEMPTS && previous.attempts >= MIN_TREND_ATTEMPTS;
  const changePoints = hasComparison && currentRate !== null && previousRate !== null
    ? Math.round((currentRate - previousRate) * 100)
    : null;

  const totalSessions = games.reduce((total, game) => total + game.sessions, 0);
  const totalAttempts = games.reduce((total, game) => total + game.attempts, 0);
  const totalSuccesses = games.reduce((total, game) => total + game.successes, 0);

  return {
    games,
    mostPlayed,
    needsPractice,
    focusAreas,
    totalSessions,
    totalAttempts,
    totalSuccesses,
    overallSuccessRate: rate(totalSuccesses, totalAttempts),
    activeDays: recentDays.filter((day) => day.sessions > 0 || day.attempts > 0).length,
    recentDays,
    trend: {
      status: trendStatus(current.attempts, changePoints),
      currentAttempts: current.attempts,
      previousAttempts: previous.attempts,
      currentRate,
      previousRate,
      changePoints,
    },
  };
}

function toGameMetric(gameId: string, title: string, subject: string, progress?: GameProgress): ReportGameMetric {
  const attempts = progress?.attempts ?? 0;
  const successes = progress?.successes ?? 0;
  return {
    gameId,
    title,
    subject,
    sessions: progress?.sessions ?? 0,
    attempts,
    successes,
    completedRounds: progress?.completedRounds ?? 0,
    successRate: rate(successes, attempts),
    lastPlayedAt: progress?.lastPlayedAt,
  };
}

function aggregateDay(date: string, progress: Record<string, GameProgress>): ReportDay {
  const totals = Object.values(progress).reduce(
    (result, game) => {
      const day = game.daily?.[date];
      if (day) {
        result.attempts += day.attempts;
        result.successes += day.successes;
        result.sessions += day.sessions;
      }
      return result;
    },
    { attempts: 0, successes: 0, sessions: 0 },
  );
  return { date, ...totals, successRate: rate(totals.successes, totals.attempts) };
}

function totalDays(days: readonly ReportDay[]) {
  return days.reduce((total, day) => ({
    attempts: total.attempts + day.attempts,
    successes: total.successes + day.successes,
  }), { attempts: 0, successes: 0 });
}

function lastDateKeys(count: number, now: Date): string[] {
  const end = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return Array.from({ length: count }, (_, index) => new Date(end - (count - index - 1) * 86_400_000).toISOString().slice(0, 10));
}

function rate(successes: number, attempts: number): number | null {
  return attempts > 0 ? successes / attempts : null;
}

function trendStatus(currentAttempts: number, changePoints: number | null): TrendStatus {
  if (currentAttempts === 0) return "no-recent-practice";
  if (changePoints === null) return "building-baseline";
  if (changePoints >= 5) return "improving";
  if (changePoints <= -5) return "needs-support";
  return "steady";
}

function toFocusArea(progress: LearningContentProgress): ReportFocusArea {
  return {
    skillId: progress.skillId,
    skillLabel: skillLabel(progress.skillId),
    contentId: progress.contentId,
    contentLabel: contentLabel(progress.contentId),
    attempts: progress.attempts,
    correct: progress.correct,
    successRate: progress.correct / progress.attempts,
  };
}

function contentLabel(contentId: string): string {
  const letter = getLetterContent(contentId);
  if (letter) return `Letter ${letter.display}`;
  const word = getTrickyWordContent(contentId);
  if (word) return `Word “${word.text}”`;
  const number = getNumberContent(contentId);
  if (number) return `Number ${number.display}`;
  return humanize(contentId);
}

function skillLabel(skillId: string): string {
  const labels: Record<string, string> = {
    "reading.letter-sound-correspondence": "Letter sounds",
    "reading.sight-word-recognition": "Tricky words",
    "math.number-recognition": "Number recognition",
    "math.number-sequence": "Number sequence",
  };
  return labels[skillId] ?? humanize(skillId);
}

function humanize(id: string): string {
  const value = id.split(".").at(-1)?.replaceAll("-", " ") ?? id;
  return value.charAt(0).toUpperCase() + value.slice(1);
}
