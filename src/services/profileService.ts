import type { Grade, LearnerProfile, StoredLearner } from "../domain/models";
import { AppDataService } from "./appDataService";
import { DEFAULT_LEARNER_PREFERENCES } from "./appDataService";

export class ProfileService {
  constructor(private readonly appData: AppDataService) {}

  list(): LearnerProfile[] {
    return this.appData.get().learners.map(ProfileService.toPublicProfile);
  }

  get(id: string): LearnerProfile | undefined {
    const learner = this.appData.get().learners.find((item) => item.id === id);
    return learner ? ProfileService.toPublicProfile(learner) : undefined;
  }

  async create(displayName: string, grade: Grade): Promise<LearnerProfile> {
    const trimmedName = displayName.trim();
    if (!trimmedName) throw new Error("Please enter a learner name.");
    const learner: StoredLearner = {
      id: crypto.randomUUID(),
      displayName: trimmedName,
      grade,
      createdAt: new Date().toISOString(),
      schemaVersion: 2,
      progress: {},
      learningProgress: {},
      preferences: structuredClone(DEFAULT_LEARNER_PREFERENCES),
      gameConfigurationRefs: [],
      privateValues: {},
    };
    await this.appData.update((data) => data.learners.push(learner));
    return ProfileService.toPublicProfile(learner);
  }

  async update(id: string, displayName: string, grade: Grade): Promise<void> {
    const trimmedName = displayName.trim();
    if (!trimmedName) throw new Error("Please enter a learner name.");
    await this.appData.update((data) => {
      const learner = data.learners.find((item) => item.id === id);
      if (!learner) throw new Error("Learner was not found.");
      learner.displayName = trimmedName;
      learner.grade = grade;
    });
  }

  async remove(id: string): Promise<void> {
    await this.appData.update((data) => {
      data.learners = data.learners.filter((learner) => learner.id !== id);
    });
  }

  private static toPublicProfile(learner: StoredLearner): LearnerProfile {
    return structuredClone({
      id: learner.id,
      displayName: learner.displayName,
      grade: learner.grade,
      createdAt: learner.createdAt,
      schemaVersion: learner.schemaVersion,
      progress: learner.progress,
      learningProgress: learner.learningProgress,
      preferences: learner.preferences,
      gameConfigurationRefs: learner.gameConfigurationRefs,
    });
  }
}
