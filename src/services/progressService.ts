import type { GameProgress } from "../domain/models";
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

  private async mutate(
    learnerId: string,
    gameId: string,
    mutateProgress: (progress: GameProgress) => void,
  ): Promise<void> {
    await this.appData.update((data) => {
      const learner = data.learners.find((item) => item.id === learnerId);
      if (!learner) throw new Error("Learner was not found.");
      learner.progress[gameId] ??= {
        gameId,
        attempts: 0,
        successes: 0,
        completedRounds: 0,
        sessions: 0,
      };
      mutateProgress(learner.progress[gameId]);
    });
  }
}
