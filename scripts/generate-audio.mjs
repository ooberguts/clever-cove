import { mkdir, mkdtemp, readFile, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn } from "node:child_process";

function parseArguments(args) {
  const options = { force: false, ids: [], voice: "Samantha" };
  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (argument === "--force") options.force = true;
    else if (argument === "--ids") options.ids.push(...(args[++index] ?? "").split(",").filter(Boolean));
    else if (argument === "--id") options.ids.push(args[++index] ?? "");
    else if (argument === "--voice") options.voice = args[++index] ?? options.voice;
    else throw new Error(`Unknown argument: ${argument}`);
  }
  return options;
}

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: "inherit" });
    child.once("error", reject);
    child.once("exit", (code) => code === 0 ? resolve() : reject(new Error(`${command} exited with status ${code}`)));
  });
}

async function fileExists(path) {
  try {
    return (await stat(path)).isFile();
  } catch {
    return false;
  }
}

if (process.platform !== "darwin") {
  console.error("audio:generate is a macOS development tool because it uses the built-in say and afconvert commands.");
  process.exit(1);
}

const options = parseArguments(process.argv.slice(2));
const rootUrl = new URL("../", import.meta.url);
const manifest = JSON.parse(await readFile(new URL("src/content/audio-assets.json", rootUrl), "utf8"));
const selectedIds = new Set(options.ids);
const missingIds = options.ids.filter((id) => !manifest.some((asset) => asset.id === id));
if (missingIds.length) {
  console.error(`Unknown audio ID(s): ${missingIds.join(", ")}`);
  process.exit(1);
}

const selected = selectedIds.size ? manifest.filter((asset) => selectedIds.has(asset.id)) : manifest;
const temporaryDirectory = await mkdtemp(join(tmpdir(), "clever-cove-audio-"));
let generated = 0;
let skipped = 0;
let failed = 0;

try {
  for (const asset of selected) {
    const outputUrl = new URL(`public/${asset.path}`, rootUrl);
    if (!options.force && await fileExists(outputUrl)) {
      skipped += 1;
      continue;
    }

    const aiffPath = join(temporaryDirectory, `${asset.id.replace(/[^A-Za-z0-9.-]/g, "-")}.aiff`);
    try {
      await mkdir(new URL("./", outputUrl), { recursive: true });
      await run("/usr/bin/say", ["-v", options.voice, "-o", aiffPath, asset.text]);
      if ((await stat(aiffPath)).size <= 4096) throw new Error("say produced an empty audio file");
      await run("/usr/bin/afconvert", ["-f", "WAVE", "-d", "LEI16@22050", "-c", "1", aiffPath, outputUrl.pathname]);
      if ((await stat(outputUrl)).size <= 4096) throw new Error("afconvert produced an empty WAV file");
      generated += 1;
      const reviewNote = asset.reviewStatus === "adult-review-required" ? " (PLACEHOLDER — adult phonics review required)" : "";
      console.log(`Generated ${asset.id}${reviewNote}`);
    } catch (error) {
      failed += 1;
      console.error(`Failed ${asset.id}:`, error instanceof Error ? error.message : error);
    }
  }
} finally {
  await rm(temporaryDirectory, { recursive: true, force: true });
}

console.log(`Audio generation complete: ${generated} generated, ${skipped} unchanged, ${failed} failed.`);
if (failed) process.exitCode = 1;
