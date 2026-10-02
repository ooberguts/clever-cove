import audioAssets from "./audio-assets.json";
import type { AudioAssetDefinition } from "./types";

export const audioAssetManifest = audioAssets as AudioAssetDefinition[];

const audioAssetsById = new Map(audioAssetManifest.map((asset) => [asset.id, asset]));

export function getAudioAsset(id: string): AudioAssetDefinition | undefined {
  return audioAssetsById.get(id);
}
