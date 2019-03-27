import * as fs from "fs";
import * as path from "path";

import { RunnerResult, PerturbConfig } from "../types";

export interface Stats {
  total: number;
  killed: number;
  rate: number;
}

export function stats(results: RunnerResult[]): Stats {
  const killed = results.filter(r => r.error).length;
  const total = results.length;
  return {
    total,
    killed,
    rate: Number((killed / total).toFixed(4)) * 100,
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

function writeResult(last: any, s: Stats, root: string) {
  last[root] = s;
  try {
    fs.writeFileSync(RECORD_FILE, JSON.stringify(last));
  } catch (e) {
    // log error?
  }
}

export function delta(rs: RunnerResult[], cfg: PerturbConfig) {
  const s = stats(rs);
  let record: any = {};
  try {
    record = require(RECORD_FILE);
    if (record[cfg.projectRoot]) {
      console.log("change in total:", s.total - record[cfg.projectRoot].total);
      console.log(
        "change in killed:",
        s.killed - record[cfg.projectRoot].killed,
      );
    }
  } catch (e) {
    // file doesn't exist
  } finally {
    writeResult(record, s, cfg.projectRoot);
  }
}
