const fs = require("fs");
const path = require("path");
const R = require("ramda");

const RECORD_FILE = path.join(__dirname, "../../run-record.json");

interface Stats {
  killRate: number;
  killCount: number;
  total: number;
}

function calcStats (rs: RunnerResult[]): Stats {
  const [killed, alive] = R.partition(r => r.error, rs);
  const total = rs.length;
  const killCount: number = killed.length;
  const killRate = Number((killCount / total).toFixed(4)) * 100;
  return {killRate, killCount, total};
}

function writeResult (s: Stats) {
  fs.writeFileSync(RECORD_FILE, JSON.stringify(s));
}

function compare (rs: RunnerResult[]) {
  const stats = calcStats(rs);
  let last: Stats;
  try {
    last = require(RECORD_FILE);
    console.log("change in total:", stats.total - last.total);
    console.log("change in killed:", stats.killCount - last.killCount);
  } finally {
    writeResult(stats);
  }
}

export = compare;