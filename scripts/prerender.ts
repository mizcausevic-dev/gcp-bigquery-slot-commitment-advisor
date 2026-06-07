import { mkdir, writeFile } from "node:fs/promises";
import { buildProfile } from "../src/index.js";
import sample from "../fixtures/bigquery-slot-commitment-sample.json" with { type: "json" };

const profile = buildProfile(sample);
const money = (value: number) => `$${value.toLocaleString()}`;
const percent = (value: number) => `${value}%`;

const laneCards = profile.lanes
  .map(
    (lane) => `
      <article class="lane-card">
        <div class="lane-card__meta">
          <span>${lane.tier.replaceAll("_", " ")}</span>
          <strong>${lane.commitmentFitScore}</strong>
        </div>
        <h3>${lane.name}</h3>
        <p>${lane.narrative}</p>
        <dl>
          <div><dt>Project</dt><dd>${lane.project}</dd></div>
          <div><dt>Owner</dt><dd>${lane.owner}</dd></div>
          <div><dt>On-demand spend</dt><dd>${money(lane.monthlyOnDemandUsd)}</dd></div>
          <div><dt>Estimated monthly savings</dt><dd>${money(lane.estimatedMonthlySavingsUsd)}</dd></div>
          <div><dt>Median utilization</dt><dd>${percent(lane.medianSlotUtilization)}</dd></div>
          <div><dt>Waste risk</dt><dd>${lane.wasteRiskScore}</dd></div>
        </dl>
        <p class="route">${lane.boardRoute}</p>
        <p class="next"><strong>Next action:</strong> ${lane.nextAction}</p>
      </article>`
  )
  .join("");

const matrixRows = profile.lanes
  .map(
    (lane) => `
      <tr>
        <td>${lane.name}</td>
        <td>${lane.tier.replaceAll("_", " ")}</td>
        <td>${lane.commitmentFitScore}</td>
        <td>${lane.wasteRiskScore}</td>
        <td>${money(lane.estimatedMonthlySavingsUsd)}</td>
      </tr>`
  )
  .join("");

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>GCP BigQuery Slot Commitment Advisor</title>
  <meta name="description" content="Board-readable GCP BigQuery slot commitment advisor for reservation fit, idle-slot waste, on-demand exposure, and FinOps purchase sequencing." />
  <style>
    :root {
      color-scheme: dark;
      --bg: #050712;
      --ink: #f6f1e8;
      --muted: #a7b3c6;
      --subtle: #78869c;
      --panel: rgba(14, 24, 39, 0.86);
      --panel-strong: rgba(19, 31, 49, 0.95);
      --line: rgba(78, 231, 218, 0.24);
      --line-strong: rgba(86, 245, 203, 0.42);
      --cyan: #24d8ee;
      --mint: #58f0bd;
      --blue: #62a8ff;
      --violet: #9f8bff;
      --amber: #ffd166;
      --danger: #ff6b7a;
      --shadow: 0 30px 90px rgba(0, 0, 0, 0.42);
    }

    * { box-sizing: border-box; }

    html {
      width: 100%;
      max-width: 100%;
      overflow-x: hidden;
    }

    body {
      margin: 0;
      min-height: 100vh;
      overflow-x: hidden;
      background:
        radial-gradient(circle at 8% 0%, rgba(98, 168, 255, 0.17), transparent 34rem),
        radial-gradient(circle at 88% 12%, rgba(88, 240, 189, 0.13), transparent 28rem),
        linear-gradient(180deg, #080b16 0%, var(--bg) 48%, #030510 100%);
      color: var(--ink);
      font-family: "Segoe UI", system-ui, sans-serif;
    }

    main,
    .nav,
    .hero,
    .section,
    .hero-grid,
    .hero-panel,
    .signal,
    .metrics,
    .metric,
    .lanes,
    .lane-card {
      max-width: 100%;
      min-width: 0;
    }

    a { color: inherit; }

    header {
      position: sticky;
      top: 0;
      z-index: 5;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      background: rgba(5, 7, 18, 0.82);
      backdrop-filter: blur(18px);
    }

    .nav {
      width: min(1240px, calc(100vw - 32px));
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 24px;
      min-height: 78px;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 14px;
      font-weight: 850;
      font-size: 19px;
      letter-spacing: -0.03em;
      text-decoration: none;
    }

    .brand-mark {
      width: 64px;
      height: 30px;
      position: relative;
      display: inline-grid;
      align-items: center;
    }

    .brand-mark::before {
      content: "";
      position: absolute;
      width: 4px;
      height: 30px;
      left: 0;
      top: 0;
      background: #536779;
    }

    .bar {
      display: block;
      height: 5px;
      margin-left: 10px;
      background: var(--ink);
      transform: skewX(-18deg);
    }

    .bar:nth-child(1) { width: 22px; }
    .bar:nth-child(2) { width: 34px; }
    .bar:nth-child(3) { width: 46px; }

    .nav-links {
      display: flex;
      align-items: center;
      gap: 18px;
      color: var(--muted);
      font: 800 12px/1 ui-monospace, SFMono-Regular, Consolas, monospace;
      letter-spacing: 0.12em;
      text-transform: uppercase;
    }

    .nav-links a { text-decoration: none; }

    main {
      width: min(1240px, calc(100vw - 32px));
      margin: 0 auto;
      padding: clamp(28px, 5vw, 76px) 0 40px;
    }

    .hero {
      border: 1px solid var(--line);
      border-top-color: var(--line-strong);
      border-radius: 34px;
      background:
        linear-gradient(135deg, rgba(15, 26, 43, 0.98), rgba(8, 11, 24, 0.95)),
        radial-gradient(circle at 82% 18%, rgba(36, 216, 238, 0.18), transparent 24rem);
      box-shadow: var(--shadow);
      padding: clamp(28px, 6vw, 68px);
      overflow: hidden;
      position: relative;
    }

    .hero::after {
      content: "";
      position: absolute;
      inset: auto -10% -36% 42%;
      height: 360px;
      background: radial-gradient(circle, rgba(88, 240, 189, 0.12), transparent 70%);
      pointer-events: none;
    }

    .hero-grid {
      display: grid;
      grid-template-columns: minmax(0, 1.08fr) minmax(360px, 0.72fr);
      gap: clamp(24px, 4vw, 56px);
      position: relative;
      z-index: 1;
    }

    .hero-grid > * {
      min-width: 0;
      max-width: 100%;
    }

    h1 {
      margin: 0;
      max-width: 820px;
      font-size: clamp(48px, 7.5vw, 104px);
      line-height: 0.9;
      letter-spacing: -0.07em;
      overflow-wrap: break-word;
    }

    .lede {
      max-width: 820px;
      margin: 26px 0 0;
      color: var(--muted);
      font-size: clamp(18px, 2vw, 24px);
      line-height: 1.55;
    }

    .hero-panel {
      align-self: start;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 28px;
      background: rgba(255, 255, 255, 0.035);
      padding: 24px;
      display: grid;
      gap: 14px;
      align-content: start;
    }

    .signal {
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 20px;
      background: rgba(5, 9, 20, 0.52);
      padding: 18px;
    }

    .signal span {
      display: block;
      color: var(--subtle);
      font: 800 11px/1.2 ui-monospace, SFMono-Regular, Consolas, monospace;
      text-transform: uppercase;
      letter-spacing: 0.14em;
    }

    .signal strong {
      display: block;
      margin-top: 10px;
      font-size: clamp(26px, 3.1vw, 38px);
      line-height: 1;
      letter-spacing: -0.04em;
    }

    .signal:nth-child(2) strong {
      font-size: clamp(20px, 2vw, 28px);
      line-height: 1.12;
    }

    .metrics {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 14px;
      margin-top: 24px;
    }

    .metric {
      border: 1px solid rgba(255, 255, 255, 0.09);
      border-radius: 20px;
      background: rgba(255, 255, 255, 0.04);
      padding: 18px;
    }

    .metric strong {
      display: block;
      color: var(--mint);
      font-size: clamp(27px, 3vw, 40px);
      line-height: 1;
    }

    .metric span {
      display: block;
      margin-top: 9px;
      color: var(--muted);
      font: 800 11px/1.35 ui-monospace, SFMono-Regular, Consolas, monospace;
      letter-spacing: 0.12em;
      text-transform: uppercase;
    }

    .section {
      margin-top: 28px;
      border: 1px solid var(--line);
      border-radius: 30px;
      background: var(--panel);
      box-shadow: 0 20px 70px rgba(0, 0, 0, 0.25);
      padding: clamp(24px, 4vw, 42px);
    }

    .section-head {
      display: flex;
      justify-content: space-between;
      gap: 24px;
      align-items: end;
      margin-bottom: 22px;
    }

    h2 {
      margin: 0;
      font-size: clamp(34px, 5vw, 64px);
      line-height: 0.96;
      letter-spacing: -0.055em;
    }

    .section-head p {
      margin: 0;
      max-width: 520px;
      color: var(--muted);
      line-height: 1.55;
    }

    .lanes {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 16px;
    }

    .lane-card {
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 24px;
      background: var(--panel-strong);
      padding: 22px;
    }

    .lane-card__meta {
      display: flex;
      justify-content: space-between;
      align-items: start;
      gap: 12px;
      color: var(--cyan);
      font: 800 11px/1.2 ui-monospace, SFMono-Regular, Consolas, monospace;
      letter-spacing: 0.13em;
      text-transform: uppercase;
    }

    .lane-card__meta strong {
      color: var(--mint);
      font: 900 32px/0.9 "Segoe UI", system-ui, sans-serif;
      letter-spacing: -0.04em;
    }

    h3 {
      margin: 16px 0 10px;
      font-size: 25px;
      line-height: 1.08;
      letter-spacing: -0.03em;
    }

    p,
    strong,
    h1,
    h2,
    h3,
    dd,
    td {
      overflow-wrap: anywhere;
    }

    p {
      color: var(--muted);
      line-height: 1.56;
    }

    dl {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 10px;
      margin: 18px 0;
    }

    dt {
      color: var(--subtle);
      font: 800 11px/1.25 ui-monospace, SFMono-Regular, Consolas, monospace;
      letter-spacing: 0.12em;
      text-transform: uppercase;
    }

    dd {
      margin: 5px 0 0;
      font-weight: 850;
      color: var(--ink);
    }

    .route {
      color: var(--ink);
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      padding-top: 14px;
    }

    .next {
      color: var(--muted);
      margin-bottom: 0;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      overflow: hidden;
      border-radius: 20px;
      font-size: 15px;
    }

    th, td {
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      padding: 16px 14px;
      text-align: left;
    }

    th {
      color: var(--subtle);
      font: 800 11px/1.2 ui-monospace, SFMono-Regular, Consolas, monospace;
      letter-spacing: 0.12em;
      text-transform: uppercase;
    }

    td:nth-child(3), td:nth-child(4), td:nth-child(5) {
      font-weight: 850;
    }

    .recommendation {
      border-left: 4px solid var(--mint);
      border-radius: 24px;
      background: linear-gradient(135deg, rgba(36, 216, 238, 0.1), rgba(159, 139, 255, 0.08));
      padding: 26px;
      color: var(--ink);
      font-size: 22px;
      line-height: 1.45;
    }

    footer {
      display: flex;
      gap: 18px;
      flex-wrap: wrap;
      color: var(--subtle);
      padding: 28px 0 0;
      font-size: 14px;
    }

    @media (max-width: 920px) {
      .hero-grid, .lanes, .metrics {
        grid-template-columns: 1fr;
      }

      .nav {
        align-items: start;
        flex-direction: column;
        padding: 18px 0;
      }

      .nav-links {
        flex-wrap: wrap;
      }

      .section-head {
        align-items: start;
        flex-direction: column;
      }

      table {
        display: block;
        overflow-x: auto;
      }
    }

    @media (max-width: 560px) {
      .nav, main {
        width: 100%;
        padding-left: 12px;
        padding-right: 12px;
      }

      .hero, .section {
        width: 100%;
        border-radius: 24px;
        padding: 22px 14px;
      }

      .hero-grid,
      .hero-panel,
      .signal {
        width: 100%;
      }

      .hero-grid {
        display: block;
      }

      .hero-panel {
        margin-top: 20px;
      }

      .hero-grid > *,
      h1,
      .lede {
        width: 100%;
      }

      h1 {
        max-width: 100%;
        font-size: clamp(29px, 8.1vw, 34px);
        line-height: 1.02;
        letter-spacing: -0.045em;
      }

      .lede {
        font-size: 16px;
        line-height: 1.55;
      }

      .hero-panel {
        border-radius: 22px;
        padding: 16px;
      }

      .signal {
        padding: 16px;
      }

      .signal strong {
        font-size: 20px;
        line-height: 1.12;
      }

      .signal:nth-child(2) strong {
        font-size: 16px;
        line-height: 1.18;
      }

      .metric strong {
        font-size: 26px;
      }
    }
  </style>
</head>
<body>
  <header>
    <nav class="nav" aria-label="Primary">
      <a class="brand" href="https://kineticgain.com/">
        <span class="brand-mark" aria-hidden="true"><span class="bar"></span><span class="bar"></span><span class="bar"></span></span>
        <span>Kinetic Gain</span>
      </a>
      <div class="nav-links">
        <a href="#lanes">Lanes</a>
        <a href="#matrix">Matrix</a>
        <a href="https://portfolio.kineticgain.com/">Portfolio</a>
        <a href="https://github.com/mizcausevic-dev/gcp-bigquery-slot-commitment-advisor">GitHub</a>
      </div>
    </nav>
  </header>
  <main>
    <section class="hero">
      <div class="hero-grid">
        <div>
          <h1>BigQuery slots need a commitment packet before cloud spend becomes inertia.</h1>
          <p class="lede">GCP BigQuery Slot Commitment Advisor turns reservation coverage, idle-slot waste, flex-slot dependency, workload predictability, and governance evidence into a board-readable FinOps purchase sequence.</p>
        </div>
        <aside class="hero-panel" aria-label="Commitment summary">
          <div class="signal"><span>Primary savings lane</span><strong>${profile.summary.highestSavingsLane}</strong></div>
          <div class="signal"><span>Recommendation</span><strong>${profile.summary.primaryRecommendation}</strong></div>
        </aside>
      </div>
      <div class="metrics">
        <div class="metric"><strong>${profile.summary.laneCount}</strong><span>Slot lanes</span></div>
        <div class="metric"><strong>${profile.summary.meanCommitmentFitScore}</strong><span>Mean fit score</span></div>
        <div class="metric"><strong>${profile.summary.commitmentReadyCount}</strong><span>Commitment ready</span></div>
        <div class="metric"><strong>${money(profile.summary.totalEstimatedMonthlySavingsUsd)}</strong><span>Monthly savings</span></div>
      </div>
    </section>
    <section class="section" id="lanes">
      <div class="section-head">
        <h2>Commitment lanes</h2>
        <p>Each lane keeps the buyer-facing decision attached to owner, project, utilization, waste risk, savings value, and the next control move.</p>
      </div>
      <div class="lanes">${laneCards}</div>
    </section>
    <section class="section" id="matrix">
      <div class="section-head">
        <h2>Board matrix</h2>
        <p>Fast comparison of where to buy, rightsize, watch, or stay on-demand before committing platform spend.</p>
      </div>
      <table>
        <thead>
          <tr>
            <th>Lane</th>
            <th>Tier</th>
            <th>Fit</th>
            <th>Waste</th>
            <th>Estimated monthly savings</th>
          </tr>
        </thead>
        <tbody>${matrixRows}</tbody>
      </table>
    </section>
    <section class="section">
      <p class="recommendation">${profile.summary.primaryRecommendation}</p>
    </section>
    <footer>
      <span>GCP BigQuery Slot Commitment Advisor</span>
      <span>Synthetic proof surface</span>
      <span>No production billing exports</span>
    </footer>
  </main>
</body>
</html>`;

await mkdir("site", { recursive: true });
await writeFile("site/index.html", html);
