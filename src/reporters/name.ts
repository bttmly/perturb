import { ReporterPlugin, RunnerResult } from "../types";

const plugin: ReporterPlugin = {
  name: "names",
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

function identifier(r: RunnerResult) {
  const loc = r.loc.start.line + "," + r.loc.start.column;
  return [
    r.error ? "DEAD: " : "ALIVE:",
    r.mutatorName,
    r.sourceFile.split(".perturb")[1],
    `@${loc}`,
    (r.error && r.error.message) || "",
  ].join(" ");
}
