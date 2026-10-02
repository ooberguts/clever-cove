import type { PrivateSettingKey } from "../domain/models";
import { AppDataService } from "./appDataService";

export const PRIVATE_VALUE_RULES: Record<PrivateSettingKey, { label: string; pattern: RegExp; message: string }> = {
  "private.student_id": {
    label: "Student ID",
    pattern: /^\d{1,12}$/,
    message: "Student ID must contain 1–12 numbers.",
  },
};

export class PrivateValueService {
  constructor(private readonly appData: AppDataService) {}

  validate(key: PrivateSettingKey, value: string): string | null {
    return PRIVATE_VALUE_RULES[key].pattern.test(value) ? null : PRIVATE_VALUE_RULES[key].message;
  }

  isConfigured(learnerId: string, key: PrivateSettingKey): boolean {
    const learner = this.appData.get().learners.find((item) => item.id === learnerId);
    return Boolean(learner?.privateValues[key]);
  }

  configuredKeys(learnerId: string): PrivateSettingKey[] {
    const learner = this.appData.get().learners.find((item) => item.id === learnerId);
    if (!learner) return [];
    return (Object.keys(learner.privateValues) as PrivateSettingKey[]).filter(
      (key) => Boolean(learner.privateValues[key]),
    );
  }

  inputLength(learnerId: string, key: PrivateSettingKey): number {
    const learner = this.appData.get().learners.find((item) => item.id === learnerId);
    return learner?.privateValues[key]?.length ?? 0;
  }

  async set(learnerId: string, key: PrivateSettingKey, value: string): Promise<void> {
    const validationError = this.validate(key, value);
    if (validationError) throw new Error(validationError);
    await this.appData.update((data) => {
      const learner = data.learners.find((item) => item.id === learnerId);
      if (!learner) throw new Error("Learner was not found.");
      learner.privateValues[key] = value;
      if (!learner.gameConfigurationRefs.includes(key)) learner.gameConfigurationRefs.push(key);
    });
  }

  matches(learnerId: string, key: PrivateSettingKey, candidate: string): boolean {
    const learner = this.appData.get().learners.find((item) => item.id === learnerId);
    if (!learner) return false;
    return learner.privateValues[key] === candidate;
  }
}
