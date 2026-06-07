#!/usr/bin/env node
import { loadProfile, renderMarkdown } from "../src/index.js";

const [, , inputPath, formatFlag, format] = process.argv;

if (!inputPath) {
  console.error("Usage: gcp-bigquery-slot-commitment-advisor <input.json> [--format markdown|json]");
  process.exit(1);
}

const profile = await loadProfile(inputPath);
console.log(formatFlag === "--format" && format === "json" ? JSON.stringify(profile, null, 2) : renderMarkdown(profile));

