import { describe, expect, it, vi } from "vitest";
import { AudioService } from "../audioService";
import type { AudioAssetDefinition } from "../../content";

const assets: AudioAssetDefinition[] = [
  { id: "word.where", kind: "word", text: "where", path: "audio/words/where.wav", reviewStatus: "generated" },
];

describe("AudioService", () => {
  it("resolves a stable ID and plays its bundled path", async () => {
    const play = vi.fn().mockResolvedValue(undefined);
    const createAudio = vi.fn(() => ({ volume: 0, play }));
    const service = new AudioService(assets, createAudio);

    expect(service.resolve("word.where")).toEqual(assets[0]);
    await expect(service.play("word.where", 0.75)).resolves.toBe(true);
    expect(createAudio).toHaveBeenCalledWith(expect.stringMatching(/audio\/words\/where\.wav$/));
    expect(play).toHaveBeenCalledOnce();
  });

  it("returns false without constructing a player for a missing ID", async () => {
    const createAudio = vi.fn(() => ({ volume: 0, play: vi.fn() }));
    const service = new AudioService(assets, createAudio);

    await expect(service.play("word.not-real")).resolves.toBe(false);
    expect(service.has("word.not-real")).toBe(false);
    expect(createAudio).not.toHaveBeenCalled();
  });

  it("contains playback failures instead of crashing the game", async () => {
    const service = new AudioService(assets, () => ({
      volume: 0,
      play: vi.fn().mockRejectedValue(new Error("unsupported audio")),
    }));

    await expect(service.play("word.where")).resolves.toBe(false);
  });
});
