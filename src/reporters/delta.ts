const fs = require("fs");
const path = require("path");
const R = require("ramda");

import { RunnerResult, PerturbConfig } from "../types";

const RECORD_FILE = path.join(__dirname, "../../run-record.json");

interface Stats {
  killRate: number;
  killCount: number;
  total: number;
}

function calcStats(rs: RunnerResult[]): Stats {
  const [killed] = R.partition((r: RunnerResult) => r.error, rs);
  const total = rs.length;
  const killCount: number = killed.length;
  const killRate = Number((killCount / total).toFixed(4)) * 100;
  return { killRate, killCount, total };
}

function writeResult(last: any, s: Stats, root: string) {
  last[root] = s;
  fs.writeFileSync(RECORD_FILE, JSON.stringify(last));
}

export default function compare(rs: RunnerResult[], cfg: PerturbConfig) {
  const stats = calcStats(rs);
  let record: any = {};
  try {
    record = require(RECORD_FILE);
    if (record[cfg.projectRoot]) {
      console.log(
        "change in total:",
        stats.total - record[cfg.projectRoot].total,
      );
      console.log(
        "change in killed:",
        stats.killCount - record[cfg.projectRoot].killCount,
      );
    }
  } finally {
    writeResult(record, stats, cfg.projectRoot);
  }
}
