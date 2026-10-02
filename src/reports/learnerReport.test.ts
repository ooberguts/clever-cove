import { describe, expect, it } from "vitest";
import type { GameProgress, LearnerProfile } from "../domain/models";
import { buildLearnerReport } from "./learnerReport";

function gameProgress(gameId: string, sessions: number, attempts: number, successes: number, daily: GameProgress["daily"]): GameProgress {
  return { gameId, sessions, attempts, successes, completedRounds: successes, daily, lastPlayedAt: "2026-09-28T12:00:00.000Z" };
}

function learner(): LearnerProfile {
  return {
    id: "report-learner",
    displayName: "Maya",
    grade: "K",
    createdAt: "2026-01-01T00:00:00.000Z",
    schemaVersion: 3,
    gameConfigurationRefs: [],
    preferences: { countingMaximum: 25, letterFocusIds: [], trickyWordGroup: "all" },
    progress: {
      "math.counting-practice": gameProgress("math.counting-practice", 3, 10, 6, {
        "2026-09-20": { date: "2026-09-20", attempts: 5, successes: 2, completedRounds: 2, sessions: 1 },
        "2026-09-28": { date: "2026-09-28", attempts: 5, successes: 4, completedRounds: 4, sessions: 1 },
      }),
      "reading.letter-sound-match": gameProgress("reading.letter-sound-match", 5, 8, 4, {}),
    },
    learningProgress: {
      "reading.sight-word-recognition::word.where": {
        skillId: "reading.sight-word-recognition",
        contentId: "word.where",
        attempts: 10,
        correct: 4,
        daily: {},
      },
    },
  };
}

describe("learner report metrics", () => {
  it("identifies most-played and lower-accuracy games without guessing from tiny samples", () => {
    const report = buildLearnerReport(learner(), new Date("2026-10-01T12:00:00.000Z"));
    expect(report.mostPlayed?.gameId).toBe("reading.letter-sound-match");
    expect(report.needsPractice.map((game) => game.gameId)).toEqual([
      "reading.letter-sound-match",
      "math.counting-practice",
    ]);
    expect(report.totalSessions).toBe(8);
    expect(report.overallSuccessRate).toBeCloseTo(10 / 18);
  });

  it("compares the latest seven days with the previous seven days", () => {
    const report = buildLearnerReport(learner(), new Date("2026-10-01T12:00:00.000Z"));
    expect(report.trend).toMatchObject({
      status: "improving",
      previousAttempts: 5,
      currentAttempts: 5,
      previousRate: 0.4,
      currentRate: 0.8,
      changePoints: 40,
    });
    expect(report.activeDays).toBe(2);
    expect(report.recentDays).toHaveLength(14);
  });

  it("surfaces stable content IDs as friendly focus areas", () => {
    const report = buildLearnerReport(learner(), new Date("2026-10-01T12:00:00.000Z"));
    expect(report.focusAreas[0]).toMatchObject({
      skillLabel: "Tricky words",
      contentLabel: "Word “where”",
      attempts: 10,
      correct: 4,
      successRate: 0.4,
    });
  });

  it("uses a baseline state until both seven-day windows have enough answers", () => {
    const profile = learner();
    profile.progress["math.counting-practice"].daily = {
      "2026-09-30": { date: "2026-09-30", attempts: 2, successes: 2, completedRounds: 2, sessions: 1 },
    };
    const report = buildLearnerReport(profile, new Date("2026-10-01T12:00:00.000Z"));
    expect(report.trend.status).toBe("building-baseline");
    expect(report.trend.changePoints).toBeNull();
  });
});
