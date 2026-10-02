import { describe, expect, it } from "vitest";
import { missingGameSettings } from "../../games/registry";
import { studentIdManifest, STUDENT_ID_GAME_ID } from "../../games/student-id/manifest";
import type { AppData } from "../../domain/models";
import { AppDataService } from "../appDataService";
import { createTestServices, MemoryStorage } from "../../test/testServices";

describe("private settings, game locks, progress, and exports", () => {
  it("backs up and migrates version 1 learners to safe learning defaults", async () => {
    const storage = new MemoryStorage();
    storage.data = {
      schemaVersion: 1,
      learners: [{
        id: "legacy-learner",
        displayName: "Legacy",
        grade: "K",
        createdAt: "2025-01-01T00:00:00.000Z",
        schemaVersion: 1,
        progress: {},
        gameConfigurationRefs: [],
        privateValues: {},
      }],
    } as unknown as AppData;
    const appData = new AppDataService(storage);
    const migrated = await appData.initialize();
    expect(storage.backups).toHaveLength(1);
    expect(migrated.schemaVersion).toBe(2);
    expect(migrated.learners[0]).toMatchObject({
      schemaVersion: 2,
      learningProgress: {},
      preferences: { countingMaximum: 25, letterFocusIds: [], trickyWordGroup: "all" },
    });
  });

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

  it("stores per-learner Kindergarten practice preferences", async () => {
    const { services } = await createTestServices();
    const learner = await services.profiles.create("Ari", "K");
    await services.learningPreferences.setCountingMaximum(learner.id, 50);
    await services.learningPreferences.setLetterFocusIds(learner.id, ["letter.a", "letter.m", "letter.a"]);
    await services.learningPreferences.setTrickyWordGroup(learner.id, "tricky.term-2");
    expect(services.learningPreferences.get(learner.id)).toEqual({
      countingMaximum: 50,
      letterFocusIds: ["letter.a", "letter.m"],
      trickyWordGroup: "tricky.term-2",
    });
  });

  it("records content-level learning aggregates without storing an answer", async () => {
    const { services, storage } = await createTestServices();
    const learner = await services.profiles.create("Ari", "K");
    await services.progress.recordLearningAttempt(
      learner.id,
      "reading.letter-sound-match",
      "reading.letter-sound-correspondence",
      "letter.m",
      false,
    );
    await services.progress.recordLearningAttempt(
      learner.id,
      "reading.letter-sound-match",
      "reading.letter-sound-correspondence",
      "letter.m",
      true,
    );
    expect(services.progress.getLearning(learner.id)).toEqual([
      expect.objectContaining({ contentId: "letter.m", attempts: 2, correct: 1 }),
    ]);
    expect(JSON.stringify(storage.data?.learners[0].learningProgress)).not.toContain("chosenAnswer");
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
    expect(exported.learners[0].games.find((game) => game.game_id === STUDENT_ID_GAME_ID)).toMatchObject({ configured: true, input_length: 7, attempts: 1, successes: 1, success_rate: 1 });
    expect(serialized).not.toContain("Ari Secretname");
    expect(serialized).not.toContain("2468");
    expect(serialized).not.toContain("8675309");
    expect(serialized).not.toContain("private.student_id");
  });

  it("exports allow-listed educational aggregates without identity or private values", async () => {
    const { services } = await createTestServices();
    const learner = await services.profiles.create("Name Must Stay Private", "K");
    await services.privateValues.set(learner.id, "private.student_id", "123456");
    await services.progress.recordLearningAttempt(
      learner.id,
      "reading.tricky-word-match",
      "reading.sight-word-recognition",
      "word.where",
      true,
    );
    const exported = services.anonymousExport.create();
    expect(exported.learners[0].learning).toEqual([{
      skill_id: "reading.sight-word-recognition",
      content_id: "word.where",
      attempts: 1,
      correct: 1,
    }]);
    const serialized = JSON.stringify(exported);
    expect(serialized).not.toContain("Name Must Stay Private");
    expect(serialized).not.toContain("123456");
    expect(serialized).not.toContain(learner.id);
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
