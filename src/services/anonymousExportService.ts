import type { AnonymousExport } from "../domain/models";
import { gameRegistry } from "../games/registry";
import { AppDataService } from "./appDataService";

export class AnonymousExportService {
  constructor(private readonly appData: AppDataService) {}

  create(): AnonymousExport {
    return {
      export_version: 2,
      generated_at: new Date().toISOString(),
      learners: this.appData.get().learners.map((learner, index) => ({
        anonymous_id: `learner-${index + 1}`,
        grade: learner.grade,
        games: gameRegistry.map((game) => {
          const progress = learner.progress[game.id] ?? {
            attempts: 0,
            successes: 0,
            completedRounds: 0,
            sessions: 0,
            daily: {},
          };
          const privateValue = learner.privateValues["private.student_id"];
          return {
            game_id: game.id,
            configured: game.requiredSettings.every((key) => Boolean(learner.privateValues[key])),
            input_length: game.requiredSettings.includes("private.student_id") ? (privateValue?.length ?? 0) : 0,
            attempts: progress.attempts,
            successes: progress.successes,
            success_rate: progress.attempts ? progress.successes / progress.attempts : 0,
            completed_rounds: progress.completedRounds,
            sessions: progress.sessions,
          };
        }),
        learning_preferences: {
          counting_maximum: learner.preferences.countingMaximum,
          letter_focus_count: learner.preferences.letterFocusIds.length,
          tricky_word_group: learner.preferences.trickyWordGroup,
        },
        learning: Object.values(learner.learningProgress).map((progress) => ({
          skill_id: progress.skillId,
          content_id: progress.contentId,
          attempts: progress.attempts,
          correct: progress.correct,
        })),
      })),
    };
  }
}
