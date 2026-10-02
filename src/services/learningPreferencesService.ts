import {
  COUNTING_MAXIMUMS,
  TRICKY_WORD_GROUPS,
  type CountingMaximum,
  type LearnerPreferences,
  type TrickyWordGroup,
} from "../domain/models";
import { AppDataService } from "./appDataService";

export class LearningPreferencesService {
  constructor(private readonly appData: AppDataService) {}

  get(learnerId: string): LearnerPreferences {
    const learner = this.appData.get().learners.find((item) => item.id === learnerId);
    if (!learner) throw new Error("Learner was not found.");
    return structuredClone(learner.preferences);
  }

  async setCountingMaximum(learnerId: string, maximum: CountingMaximum): Promise<void> {
    if (!COUNTING_MAXIMUMS.includes(maximum)) throw new Error("Choose 25, 50, or 100.");
    await this.update(learnerId, (preferences) => { preferences.countingMaximum = maximum; });
  }

  async setLetterFocusIds(learnerId: string, ids: readonly string[]): Promise<void> {
    const unique = [...new Set(ids)];
    if (unique.some((id) => !/^letter\.[a-z]$/.test(id))) throw new Error("The letter focus set contains an invalid letter.");
    await this.update(learnerId, (preferences) => { preferences.letterFocusIds = unique; });
  }

  async setTrickyWordGroup(learnerId: string, group: TrickyWordGroup): Promise<void> {
    if (!TRICKY_WORD_GROUPS.includes(group)) throw new Error("Choose a valid tricky-word group.");
    await this.update(learnerId, (preferences) => { preferences.trickyWordGroup = group; });
  }

  private async update(learnerId: string, mutate: (preferences: LearnerPreferences) => void): Promise<void> {
    await this.appData.update((data) => {
      const learner = data.learners.find((item) => item.id === learnerId);
      if (!learner) throw new Error("Learner was not found.");
      mutate(learner.preferences);
    });
  }
}
