const chalk = require("chalk");
const { diffLines } = require("diff");
const changeCase = require("change-case");
const R = require("ramda");

import { ReporterPlugin, RunnerResult } from "../types";

module.exports = <ReporterPlugin>{
  name: "diff",
  onResult: function(r: RunnerResult) {
    console.log(generateReport(r));
  },
  onFinish: function(rs: Array<RunnerResult>) {
    const [killed, alive] = R.partition(r => r.error, rs);
    const total = rs.length;
    const killCount = killed.length;
    const killRate = Number((killCount / total).toFixed(4)) * 100;
    console.log(`Total: ${total}. Killed: ${killCount}. Rate: ${killRate}%`);
  },
};

function generateReport (r: RunnerResult): string {
  const plus = "+    ";
  const minus = "-    ";
  const alive = "#ALIVE: ";
  const dead = "#DEAD: ";

  const id = identifier(r);

  if (r.error) {
    return chalk.gray(id);
  }

  const title = chalk.red.underline(alive + id);
  const diff = generateDiff(r);

  return [
    title,
    diff.map(function (entry) {
      const color = entry.added ? "green" : "red";
      const sign = entry.added ? plus : minus;
      return chalk[color](
        entry.value.trim().split("\n").map(l => sign + l).join("\n")
       );
    }).join("\n"),
  ].join("\n");
}

function generateDiff (r: RunnerResult) {
  return diffLines(r.originalSourceCode, r.mutatedSourceCode)
    .filter(node => node.added || node.removed);
}

function identifier (r: RunnerResult) {
  const loc = r.loc.start.line + "," + r.loc.start.column;

  // hack :/
  const file = r.sourceFile.split(".perturb")[1];

  return changeCase.sentence(r.mutatorName) + " " + file + "@" + loc;
}
