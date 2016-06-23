import chalk from "chalk";
import { diffLines } from "diff";
import * as changeCase from "change-case";
import * as R from "ramda";

import { ReporterPlugin, RunnerResult } from "../types";

const plugin : ReporterPlugin = {
  name: "diff",
  onResult: function (r: RunnerResult) {
    console.log(generateReport(r));
  },
  onFinish: function (rs: Array<RunnerResult>) {
    const [killed, alive] = R.partition(r => r.error, rs);
    console.log(`Total: ${rs.length}. Killed: ${killed.length}. Rate: ${(rs.length / killed.length).toFixed(4) * 100}%`)
  },
}

export default plugin;

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
    report.diff.map(function (entry) {
      const color = entry.added ? "green" : "red";
      const sign = entry.added ? plus : minus;
      return chalk[color](sign + entry.value.trim());
    }).join("\n"),
  ].join("\n");
}

function generateDiff (r: RunnerResult) {
  return diffLines(r.sourceCode, r.mutatedSourceCode)
    .filter(node => node.added || node.removed);
}

function identifier (r: RunnerResult) {
  const loc = r.loc.start.line + "," + r.loc.start.column;
  return changeCase.sentence(r.name) + " @" + r.loc;
}
