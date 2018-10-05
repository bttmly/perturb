import * as fs from "fs";
import * as path from "path";
import { RunnerResult, PerturbConfig } from "../types";

const RECORD_FILE = path.join(__dirname, "../../run-record.json");

interface Stats {
  killRate: number;
  killCount: number;
  total: number;
}

function calcStats(rs: RunnerResult[]): Stats {
  const killed = rs.filter(r => r.error);
  const total = rs.length;
  const killCount = killed.length;
  const killRate = Number((killCount / total).toFixed(4)) * 100;
  return { killRate, killCount, total };
}

function writeResult(last: any, s: Stats, root: string) {
  last[root] = s;
  try {
    fs.writeFileSync(RECORD_FILE, JSON.stringify(last));
  } catch (e) { }
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
  }
  catch (e) {
    // file doesn't exist
  } finally {
    writeResult(record, stats, cfg.projectRoot);
  }
}
