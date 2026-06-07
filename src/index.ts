import { readFile } from "node:fs/promises";

export type CommitmentTier = "COMMITMENT_READY" | "RIGHTSIZE" | "WATCH" | "STAY_ON_DEMAND";

export interface SlotCommitmentLane {
  name: string;
  owner: string;
  audience: string;
  project: string;
  monthlyOnDemandUsd: number;
  projectedMonthlySlotHours: number;
  medianSlotUtilization: number;
  peakSlotUtilization: number;
  reservationCoverage: number;
  workloadPredictability: number;
  commitmentGovernance: number;
  idleSlotControl: number;
  biEngineSeparation: number;
  flexSlotDependency: number;
  slaPressure: number;
  dataProductCriticality: number;
  historicalVariance: number;
  narrative: string;
  nextAction: string;
}

export interface SlotCommitmentInput {
  generatedAt: string;
  organization: string;
  lanes: SlotCommitmentLane[];
}

export interface ScoredSlotCommitmentLane extends SlotCommitmentLane {
  commitmentFitScore: number;
  wasteRiskScore: number;
  estimatedMonthlySavingsUsd: number;
  tier: CommitmentTier;
  boardRoute: string;
}

export interface SlotCommitmentProfile {
  generatedAt: string;
  organization: string;
  lanes: ScoredSlotCommitmentLane[];
  summary: {
    laneCount: number;
    commitmentReadyCount: number;
    stayOnDemandCount: number;
    meanCommitmentFitScore: number;
    highestSavingsLane: string;
    totalEstimatedMonthlySavingsUsd: number;
    primaryRecommendation: string;
  };
}

const clamp = (value: number, min = 0, max = 100): number => Math.min(max, Math.max(min, value));

export function classifyTier(commitmentFitScore: number, wasteRiskScore: number): CommitmentTier {
  if (commitmentFitScore >= 82 && wasteRiskScore <= 42) return "COMMITMENT_READY";
  if (commitmentFitScore >= 70 && wasteRiskScore <= 58) return "RIGHTSIZE";
  if (commitmentFitScore >= 56) return "WATCH";
  return "STAY_ON_DEMAND";
}

export function scoreLane(lane: SlotCommitmentLane): ScoredSlotCommitmentLane {
  const utilizationBalance = clamp(lane.medianSlotUtilization * 0.72 + lane.peakSlotUtilization * 0.28);
  const varianceControl = 100 - clamp(lane.historicalVariance);
  const flexControl = 100 - clamp(lane.flexSlotDependency);

  const commitmentFitScore = Math.round(
    clamp(
      lane.workloadPredictability * 0.18 +
        lane.commitmentGovernance * 0.15 +
        lane.reservationCoverage * 0.13 +
        lane.idleSlotControl * 0.12 +
        utilizationBalance * 0.14 +
        varianceControl * 0.11 +
        flexControl * 0.07 +
        lane.biEngineSeparation * 0.05 +
        lane.dataProductCriticality * 0.05
    )
  );

  const idleExposure = 100 - clamp(lane.medianSlotUtilization);
  const coverageGap = 100 - clamp(lane.reservationCoverage);
  const governanceGap = 100 - clamp(lane.commitmentGovernance);
  const predictabilityGap = 100 - clamp(lane.workloadPredictability);

  const wasteRiskScore = Math.round(
    clamp(
      idleExposure * 0.22 +
        coverageGap * 0.17 +
        governanceGap * 0.16 +
        lane.flexSlotDependency * 0.14 +
        lane.historicalVariance * 0.13 +
        predictabilityGap * 0.12 +
        (100 - clamp(lane.idleSlotControl)) * 0.06
    )
  );

  const savingsRate =
    commitmentFitScore >= 82 && wasteRiskScore <= 42
      ? 0.31
      : commitmentFitScore >= 70 && wasteRiskScore <= 58
        ? 0.22
        : commitmentFitScore >= 56
          ? 0.11
          : 0.05;
  const estimatedMonthlySavingsUsd = Math.round(lane.monthlyOnDemandUsd * savingsRate);
  const tier = classifyTier(commitmentFitScore, wasteRiskScore);

  const boardRoute =
    tier === "COMMITMENT_READY"
      ? "Prepare a slot commitment purchase packet with owner, coverage, utilization, and savings evidence attached."
      : tier === "RIGHTSIZE"
        ? "Rightsize reservations before commitment; remove idle waste and validate workload predictability."
        : tier === "WATCH"
          ? "Keep on a monthly watch cycle until variance, flex-slot dependency, and idle-slot controls improve."
          : "Stay on-demand until workload shape and ownership evidence are strong enough for a commitment.";

  return {
    ...lane,
    commitmentFitScore,
    wasteRiskScore,
    estimatedMonthlySavingsUsd,
    tier,
    boardRoute
  };
}

export function buildProfile(input: SlotCommitmentInput): SlotCommitmentProfile {
  const lanes = input.lanes
    .map(scoreLane)
    .sort((a, b) => b.estimatedMonthlySavingsUsd - a.estimatedMonthlySavingsUsd);
  const meanCommitmentFitScore = Math.round(
    lanes.reduce((sum, lane) => sum + lane.commitmentFitScore, 0) / Math.max(lanes.length, 1)
  );
  const totalEstimatedMonthlySavingsUsd = lanes.reduce((sum, lane) => sum + lane.estimatedMonthlySavingsUsd, 0);
  const highestSavingsLane = lanes[0]?.name ?? "No lanes";

  return {
    generatedAt: input.generatedAt,
    organization: input.organization,
    lanes,
    summary: {
      laneCount: lanes.length,
      commitmentReadyCount: lanes.filter((lane) => lane.tier === "COMMITMENT_READY").length,
      stayOnDemandCount: lanes.filter((lane) => lane.tier === "STAY_ON_DEMAND").length,
      meanCommitmentFitScore,
      highestSavingsLane,
      totalEstimatedMonthlySavingsUsd,
      primaryRecommendation: `Start with ${highestSavingsLane}; it has the strongest savings signal and needs the cleanest board packet.`
    }
  };
}

export async function loadProfile(path: string): Promise<SlotCommitmentProfile> {
  return buildProfile(JSON.parse(await readFile(path, "utf8")) as SlotCommitmentInput);
}

export function renderMarkdown(profile: SlotCommitmentProfile): string {
  const rows = profile.lanes
    .map(
      (lane) =>
        `| ${lane.name} | ${lane.tier} | ${lane.commitmentFitScore} | ${lane.wasteRiskScore} | $${lane.monthlyOnDemandUsd.toLocaleString()} | $${lane.estimatedMonthlySavingsUsd.toLocaleString()} | ${lane.nextAction} |`
    )
    .join("\n");

  return [
    "# GCP BigQuery Slot Commitment Advisor",
    "",
    `Organization: ${profile.organization}`,
    "",
    `Primary recommendation: ${profile.summary.primaryRecommendation}`,
    "",
    "| Lane | Tier | Fit score | Waste risk | On-demand spend | Estimated monthly savings | Next action |",
    "| --- | --- | ---: | ---: | ---: | ---: | --- |",
    rows
  ].join("\n");
}

