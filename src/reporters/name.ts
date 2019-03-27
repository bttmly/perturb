import { ReporterPlugin, RunnerResult } from "../types";
import { identifier } from "./helpers";

const plugin: ReporterPlugin = {
  name: "names",
  type: "reporter",
  onResult(r: RunnerResult) {
    console.log(identifier(r));
  },
  onFinish(rs: RunnerResult[]) {
    // const str = rs.map(identifier).join("\n");
    // const loc = path.join(__dirname, "../run-log");
    // fs.writeFileSync(loc, str);
  },
};

export default plugin;
