import { stats, delta } from "./helpers";

import {
  ReporterPlugin,
  RunnerResult,
  PerturbConfig,
  PerturbMetadata,
} from "../types";

const plugin: ReporterPlugin = {
  name: "quiet",
  type: "reporter",
  onResult(r: RunnerResult) { },
  onFinish(rs: RunnerResult[], cfg: PerturbConfig, m?: PerturbMetadata) {
    const { total, killed, rate } = stats(rs);
    console.log(`Total: ${total}. Killed: ${killed}. Rate: ${rate}%`);
    delta(rs, cfg);
  },
};
export default plugin;