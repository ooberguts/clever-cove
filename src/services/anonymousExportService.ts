import type { AnonymousExport } from "../domain/models";
import { gameRegistry } from "../games/registry";
import { AppDataService } from "./appDataService";

export class AnonymousExportService {
  constructor(private readonly appData: AppDataService) {}

  create(): AnonymousExport {
    return {
      export_version: 1,
      generated_at: new Date().toISOString(),
      learners: this.appData.get().learners.map((learner, index) => ({
        anonymous_id: `learner-${index + 1}`,
        grade: learner.grade,
        games: gameRegistry.map((game) => {
          const progress = learner.progress[game.id] ?? {
            attempts: 0,
            successes: 0,
          };
          const privateValue = learner.privateValues["private.student_id"];
          return {
            game_id: game.id,
            configured: game.requiredSettings.every((key) => Boolean(learner.privateValues[key])),
            input_length: privateValue?.length ?? 0,
            attempts: progress.attempts,
            successes: progress.successes,
            success_rate: progress.attempts ? progress.successes / progress.attempts : 0,
          };
        }),
      })),
    };
  }
}
