import { loadContentFromDisk, validateContent } from "./content-validation.mjs";

try {
  const content = await loadContentFromDisk();
  const errors = validateContent(content);
  if (errors.length) {
    console.error(`Content validation failed with ${errors.length} error(s):`);
    for (const error of errors) console.error(`- ${error}`);
    process.exitCode = 1;
  } else {
    console.log(`Content validation passed: ${content.letters.length} letters, ${content.trickyWords.words.length} tricky words, and ${content.audioAssets.length} local audio definitions.`);
  }
} catch (error) {
  console.error("Content validation could not run:", error);
  process.exitCode = 1;
}
