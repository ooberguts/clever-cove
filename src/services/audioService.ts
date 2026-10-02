import { audioAssetManifest } from "../content/audioAssetManifest";
import type { AudioAssetDefinition } from "../content/types";

interface PlayableAudio {
  volume: number;
  play(): Promise<void>;
}

type AudioFactory = (source: string) => PlayableAudio;

const defaultAudioFactory: AudioFactory = (source) => new Audio(source);

/** Resolves stable curriculum audio IDs to bundled, offline audio files. */
export class AudioService {
  private readonly assetsById: ReadonlyMap<string, AudioAssetDefinition>;

  constructor(
    assets: readonly AudioAssetDefinition[] = audioAssetManifest,
    private readonly createAudio: AudioFactory = defaultAudioFactory,
  ) {
    this.assetsById = new Map(assets.map((asset) => [asset.id, asset]));
  }

  resolve(id: string): AudioAssetDefinition | undefined {
    return this.assetsById.get(id);
  }

  has(id: string): boolean {
    return this.assetsById.has(id);
  }

  /** Plays an asset when available. Missing or unplayable assets return false and never throw. */
  async play(id: string, volume = 1): Promise<boolean> {
    const asset = this.resolve(id);
    if (!asset) return false;

    try {
      const audio = this.createAudio(this.sourceFor(asset));
      audio.volume = Math.min(1, Math.max(0, volume));
      await audio.play();
      return true;
    } catch {
      return false;
    }
  }

  private sourceFor(asset: AudioAssetDefinition): string {
    const relativePath = asset.path.replace(/^\/+/, "");
    return new URL(relativePath, document.baseURI).href;
  }
}
