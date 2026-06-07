import { describe, expect, it } from "vitest";
import sample from "../fixtures/bigquery-slot-commitment-sample.json" with { type: "json" };
import { buildProfile, classifyTier, renderMarkdown, scoreLane } from "../src/index.js";

describe("gcp bigquery slot commitment advisor", () => {
  it("classifies commitment tiers", () => {
    expect(classifyTier(88, 30)).toBe("COMMITMENT_READY");
    expect(classifyTier(76, 50)).toBe("RIGHTSIZE");
    expect(classifyTier(62, 70)).toBe("WATCH");
    expect(classifyTier(44, 81)).toBe("STAY_ON_DEMAND");
  });

  it("scores lanes with commitment fit and waste risk", () => {
    const scored = scoreLane(sample.lanes[0]);
    expect(scored.commitmentFitScore).toBeGreaterThan(75);
    expect(scored.estimatedMonthlySavingsUsd).toBeGreaterThan(50000);
    expect(scored.boardRoute).toContain("commitment");
  });

  it("sorts lanes by estimated monthly savings", () => {
    const profile = buildProfile(sample);
    expect(profile.summary.laneCount).toBe(5);
    expect(profile.lanes[0].estimatedMonthlySavingsUsd).toBeGreaterThanOrEqual(
      profile.lanes[1].estimatedMonthlySavingsUsd
    );
    expect(profile.summary.primaryRecommendation).toContain(profile.summary.highestSavingsLane);
  });

  it("renders board-readable markdown", () => {
    const markdown = renderMarkdown(buildProfile(sample));
    expect(markdown).toContain("| Lane | Tier | Fit score | Waste risk |");
    expect(markdown).toContain("Customer analytics reservation lane");
    expect(markdown).toContain("Product exploration sandbox");
  });
});

