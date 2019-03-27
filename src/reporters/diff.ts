import chalk from "chalk";
import { diffLines } from "diff";

import { stats, delta, identifier } from "./helpers";

import {
  ReporterPlugin,
  RunnerResult,
  PerturbConfig,
  PerturbMetadata,
} from "../types";

const plugin: ReporterPlugin = {
  name: "diff",
  type: "reporter",
  onResult(r: RunnerResult) {
    console.log(resultDiff(r));
  },
  onFinish(rs: RunnerResult[], cfg: PerturbConfig, m?: PerturbMetadata) {
    const { total, killed, rate } = stats(rs);
    console.log(`Total: ${total}. Killed: ${killed}. Rate: ${rate}%`);
    delta(rs, cfg);
  },
};
export default plugin;

function resultDiff(r: RunnerResult): string {
  const plus = "+    ";
  const minus = "-    ";
  const id = identifier(r);

  // TODO: shorter output format for killed?

  // if (r.error) {
  //   return chalk.gray(id);
  // }

  return [
    r.error ? chalk.gray(id) : chalk.red.underline(id),
    ...generateDiff(r).map((entry: any) => {
      const color = r.error ? "gray" : entry.added ? "green" : "red";
      const sign = entry.added ? plus : minus;
      return chalk[color](
        entry.value
          .trim()
          .split("\n")
          .map((l: string) => sign + l)
          .join("\n"),
      );
    }),
  ].join("\n");
}

function generateDiff(r: RunnerResult) {
  return diffLines(r.originalSourceCode, r.mutatedSourceCode).filter(
    (node: any) => node.added || node.removed,
  );
}
