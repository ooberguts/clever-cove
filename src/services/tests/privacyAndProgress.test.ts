import { describe, expect, it } from "vitest";
import { missingGameSettings } from "../../games/registry";
import { studentIdManifest, STUDENT_ID_GAME_ID } from "../../games/student-id/manifest";
import { createTestServices } from "../../test/testServices";

describe("private settings, game locks, progress, and exports", () => {
  it("locks a game when its manifest requirement is missing and unlocks after setup", async () => {
    const { services } = await createTestServices();
    const learner = await services.profiles.create("Ari", "2");
    expect(missingGameSettings(studentIdManifest, services.privateValues.configuredKeys(learner.id))).toEqual(["private.student_id"]);
    await services.privateValues.set(learner.id, "private.student_id", "8421");
    expect(missingGameSettings(studentIdManifest, services.privateValues.configuredKeys(learner.id))).toEqual([]);
  });

  it("accepts only numeric Student IDs between 1 and 12 digits", async () => {
    const { services } = await createTestServices();
    const learner = await services.profiles.create("Ari", "2");
    await expect(services.privateValues.set(learner.id, "private.student_id", "12a")).rejects.toThrow("1–12 numbers");
    await expect(services.privateValues.set(learner.id, "private.student_id", "")).rejects.toThrow("1–12 numbers");
    await expect(services.privateValues.set(learner.id, "private.student_id", "1234567890123")).rejects.toThrow("1–12 numbers");
    await expect(services.privateValues.set(learner.id, "private.student_id", "1")).resolves.toBeUndefined();
    await expect(services.privateValues.set(learner.id, "private.student_id", "123456789012")).resolves.toBeUndefined();
  });

  it("increments attempts while successes only increment for correct attempts", async () => {
    const { services } = await createTestServices();
    const learner = await services.profiles.create("Ari", "2");
    await services.progress.recordAttempt(learner.id, STUDENT_ID_GAME_ID, false);
    await services.progress.recordAttempt(learner.id, STUDENT_ID_GAME_ID, true);
    expect(services.progress.get(learner.id, STUDENT_ID_GAME_ID)).toMatchObject({ attempts: 2, successes: 1, completedRounds: 1 });
  });

  it("tracks sessions and a safe last-played timestamp", async () => {
    const { services } = await createTestServices();
    const learner = await services.profiles.create("Ari", "2");
    await services.progress.startSession(learner.id, STUDENT_ID_GAME_ID);
    await services.progress.startSession(learner.id, STUDENT_ID_GAME_ID);
    const progress = services.progress.get(learner.id, STUDENT_ID_GAME_ID);
    expect(progress.sessions).toBe(2);
    expect(progress.lastPlayedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it("never stores the configured value or an incorrect guess in progress", async () => {
    const { services, storage } = await createTestServices();
    const learner = await services.profiles.create("Ari", "2");
    await services.privateValues.set(learner.id, "private.student_id", "8675309");
    const incorrectGuess = "111222";
    const success = services.privateValues.matches(learner.id, "private.student_id", incorrectGuess);
    await services.progress.recordAttempt(learner.id, STUDENT_ID_GAME_ID, success);
    const serializedProgress = JSON.stringify(storage.data?.learners[0].progress);
    expect(serializedProgress).not.toContain("8675309");
    expect(serializedProgress).not.toContain(incorrectGuess);
    expect(serializedProgress).toContain('"attempts":1');
  });

  it("creates an anonymous export with statistics but no learner name, PIN, ID, or guesses", async () => {
    const { services } = await createTestServices();
    const learner = await services.profiles.create("Ari Secretname", "2");
    await services.parentSettings.setPin("2468");
    await services.privateValues.set(learner.id, "private.student_id", "8675309");
    await services.progress.recordAttempt(learner.id, STUDENT_ID_GAME_ID, true);
    const exported = services.anonymousExport.create();
    const serialized = JSON.stringify(exported);
    expect(exported.learners[0].games[0]).toMatchObject({ configured: true, input_length: 7, attempts: 1, successes: 1, success_rate: 1 });
    expect(serialized).not.toContain("Ari Secretname");
    expect(serialized).not.toContain("2468");
    expect(serialized).not.toContain("8675309");
    expect(serialized).not.toContain("private.student_id");
  });

  it("returns public profiles without private values", async () => {
    const { services } = await createTestServices();
    const learner = await services.profiles.create("Ari", "2");
    await services.privateValues.set(learner.id, "private.student_id", "9876");
    const serialized = JSON.stringify(services.profiles.get(learner.id));
    expect(serialized).not.toContain("privateValues");
    expect(serialized).not.toContain("9876");
  });
});
