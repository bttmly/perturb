import * as fs from "fs";
import * as path from "path";
import * as R from "ramda";

import { RunnerResult, PerturbConfig } from "../types";

export interface Stats {
  total: number;
  killed: number;
  rate: number;
  timestamp: number;
}

export function stats(results: RunnerResult[]): Stats {
  const killed = results.filter(r => r.error).length;
  const total = results.length;
  return {
    total,
    killed,
    rate: Number((killed / total).toFixed(4)) * 100,
    timestamp: Date.now(),
  };
}

export function identifier(r: RunnerResult, includeErrorMessage = false) {
  const loc = r.loc.start.line + "," + r.loc.start.column;
  return [
    r.error ? "#DEAD:" : "#ALIVE:",
    r.mutatorName,
    r.sourceFile.split(".perturb")[1],
    `@${loc}`,
    (includeErrorMessage && r.error && r.error.message) || "",
  ].join(" ");
}

// configurable?
const RECORD_FILE = path.join(__dirname, "../../run-record.json");

type RunRecord = { [project: string]: Stats[] }

function writeResult(record: RunRecord, s: Stats, root: string) {
  if (record[root] == null) record[root] = []
  record[root].push(s)
  try {
    fs.writeFileSync(RECORD_FILE, JSON.stringify(record));
  } catch (e) {
    // log error?
  }
}

export function delta(rs: RunnerResult[], cfg: PerturbConfig) {
  const s = stats(rs);
  let record: RunRecord = {};
  try {
    record = require(RECORD_FILE);
    if (record[cfg.projectRoot] && record[cfg.projectRoot].length) {
      const prev: Stats = R.last(record[cfg.projectRoot])!
      console.log("change in total:", s.total - prev.total);
      console.log(
        "change in killed:",
        s.killed - prev.killed,
      );
    }
  } catch (e) {
    // file doesn't exist
  } finally {
    writeResult(record, s, cfg.projectRoot);
  }
}
