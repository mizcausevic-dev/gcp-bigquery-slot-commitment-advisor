import { readFile } from "node:fs/promises";

const html = await readFile("site/index.html", "utf8");
const markers = [
  "GCP BigQuery Slot Commitment Advisor",
  "commitment packet before cloud spend becomes inertia",
  "Customer analytics reservation lane",
  "Estimated monthly savings",
  "Product exploration sandbox"
];

for (const marker of markers) {
  if (!html.includes(marker)) {
    throw new Error(`Missing marker: ${marker}`);
  }
}

console.log("smoke ok");

