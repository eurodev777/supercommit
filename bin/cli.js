#!/usr/bin/env node
import { checkGit } from "../src/checkGit.js";
import { runCommitFlow } from "../src/commitPrompt.js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Resolver package.json
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJson = JSON.parse(
  readFileSync(join(__dirname, "../package.json"), "utf-8"),
);
const version = packageJson.version;

// Argumentos da CLI
const args = process.argv.slice(2);

if (args.includes("--version") || args.includes("-v")) {
  console.log(`gcommit v${version}`);
  process.exit(0);
}

// Inicia fluxo normal de commit
(async () => {
  await checkGit();
  await runCommitFlow();
})();
