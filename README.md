# gcp-bigquery-slot-commitment-advisor

Board-readable GCP BigQuery slot commitment advisor for reservation fit, idle-slot waste, on-demand exposure, flex-slot dependency, owner evidence, and FinOps purchase sequencing.

[![ci](https://github.com/mizcausevic-dev/gcp-bigquery-slot-commitment-advisor/actions/workflows/ci.yml/badge.svg)](https://github.com/mizcausevic-dev/gcp-bigquery-slot-commitment-advisor/actions/workflows/ci.yml)
[![pages](https://github.com/mizcausevic-dev/gcp-bigquery-slot-commitment-advisor/actions/workflows/pages.yml/badge.svg)](https://github.com/mizcausevic-dev/gcp-bigquery-slot-commitment-advisor/actions/workflows/pages.yml)
[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](LICENSE)

## Why this exists

BigQuery slot commitments can save money, but they become risky when commitment decisions are detached from utilization, workload shape, idle-slot controls, and owner evidence.

This repo answers:

- Which BigQuery workloads are ready for a slot commitment?
- Which workloads should be rightsized before purchase?
- Where does idle-slot waste or flex-slot dependency make a commitment risky?
- Which lane produces the cleanest board-ready savings packet?

## What it includes

- TypeScript scoring library for commitment fit, waste risk, and recommendation tier.
- CLI for rendering markdown or JSON decision packets from synthetic slot data.
- Static GitHub Pages proof surface for portfolio review.
- Synthetic fixture, tests, smoke check, and CI workflow.

## Local run

```bash
npm install
npm run verify
npm run demo
```

## CLI

```bash
npx gcp-bigquery-slot-commitment-advisor fixtures/bigquery-slot-commitment-sample.json --format markdown
npx gcp-bigquery-slot-commitment-advisor fixtures/bigquery-slot-commitment-sample.json --format json
```

## Kinetic Gain fit

This strengthens the GCP and BigQuery signal in the Kinetic Gain platform/company atlas: FinOps purchasing discipline, cloud-cost governance, BigQuery reservation strategy, slot utilization evidence, and board-ready savings sequencing.

The data in this repository is synthetic and safe for public review.

