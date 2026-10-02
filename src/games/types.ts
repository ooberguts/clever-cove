import type { Grade, PrivateSettingKey } from "../domain/models";

export interface GameManifest {
  id: string;
  title: string;
  description: string;
  supportedGrades: readonly Grade[];
  subject: string;
  skillIds: readonly string[];
  requiredSettings: readonly PrivateSettingKey[];
  version: string;
  route: string;
  accent: string;
}
