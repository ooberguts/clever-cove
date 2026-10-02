import { AppDataService } from "./appDataService";

async function digest(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hash), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export class ParentSettingsService {
  constructor(private readonly appData: AppDataService) {}

  hasPin(): boolean {
    return Boolean(this.appData.get().parentCredentials);
  }

  validatePin(pin: string): string | null {
    return /^\d{4,8}$/.test(pin) ? null : "Use a 4–8 digit parent PIN.";
  }

  async setPin(pin: string): Promise<void> {
    const error = this.validatePin(pin);
    if (error) throw new Error(error);
    const salt = crypto.randomUUID();
    const pinHash = await digest(`${salt}:${pin}`);
    await this.appData.update((data) => {
      data.parentCredentials = { salt, pinHash };
    });
  }

  async verifyPin(pin: string): Promise<boolean> {
    const credentials = this.appData.get().parentCredentials;
    if (!credentials) return false;
    return (await digest(`${credentials.salt}:${pin}`)) === credentials.pinHash;
  }
}
