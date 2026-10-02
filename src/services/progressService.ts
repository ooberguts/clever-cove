import type { GameProgress, LearningContentProgress } from "../domain/models";
import { AppDataService } from "./appDataService";

export class ProgressService {
  constructor(private readonly appData: AppDataService) {}

  get(learnerId: string, gameId: string): GameProgress {
    const learner = this.appData.get().learners.find((item) => item.id === learnerId);
    return structuredClone(
      learner?.progress[gameId] ?? {
        gameId,
        attempts: 0,
        successes: 0,
        completedRounds: 0,
        sessions: 0,
      },
    );
  }

  async startSession(learnerId: string, gameId: string): Promise<void> {
    await this.mutate(learnerId, gameId, (progress) => {
      progress.sessions += 1;
      progress.lastPlayedAt = new Date().toISOString();
    });
  }

  async recordAttempt(learnerId: string, gameId: string, success: boolean): Promise<void> {
    await this.mutate(learnerId, gameId, (progress) => {
      progress.attempts += 1;
      if (success) {
        progress.successes += 1;
        progress.completedRounds += 1;
      }
      progress.lastPlayedAt = new Date().toISOString();
    });
  }

  getLearning(learnerId: string): LearningContentProgress[] {
    const learner = this.appData.get().learners.find((item) => item.id === learnerId);
    return Object.values(learner?.learningProgress ?? {}).map((item) => structuredClone(item));
  }

  async recordLearningAttempt(
    learnerId: string,
    gameId: string,
    skillId: string,
    contentId: string,
    success: boolean,
  ): Promise<void> {
    const now = new Date().toISOString();
    await this.appData.update((data) => {
      const learner = data.learners.find((item) => item.id === learnerId);
      if (!learner) throw new Error("Learner was not found.");
      const gameProgress = this.ensureGameProgress(learner.progress, gameId);
      gameProgress.attempts += 1;
      if (success) {
        gameProgress.successes += 1;
        gameProgress.completedRounds += 1;
      }
      gameProgress.lastPlayedAt = now;

      const key = `${skillId}::${contentId}`;
      learner.learningProgress[key] ??= { skillId, contentId, attempts: 0, correct: 0 };
      learner.learningProgress[key].attempts += 1;
      if (success) learner.learningProgress[key].correct += 1;
      learner.learningProgress[key].lastPracticedAt = now;
    });
  }

  async recordPracticeCompletion(learnerId: string, gameId: string): Promise<void> {
    await this.mutate(learnerId, gameId, (progress) => {
      progress.completedRounds += 1;
      progress.lastPlayedAt = new Date().toISOString();
    });
  }

  private async mutate(
    learnerId: string,
    gameId: string,
    mutateProgress: (progress: GameProgress) => void,
  ): Promise<void> {
    await this.appData.update((data) => {
      const learner = data.learners.find((item) => item.id === learnerId);
      if (!learner) throw new Error("Learner was not found.");
      mutateProgress(this.ensureGameProgress(learner.progress, gameId));
    });
  }

  private ensureGameProgress(progress: Record<string, GameProgress>, gameId: string): GameProgress {
    progress[gameId] ??= { gameId, attempts: 0, successes: 0, completedRounds: 0, sessions: 0 };
    return progress[gameId];
  }
}
