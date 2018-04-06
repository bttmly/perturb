import S = require("./_syntax");
import util = require("./util");
import { MutatorPlugin } from "../types";

// drops each argument to a function/method call in turn
// input: `fn(a, b, c)`
// output: [`fn(b, c)`, `fn(a, c)`, `fn(a, b)`]

const plugin: MutatorPlugin = {
  name: "tweak-arguments",
  nodeTypes: [S.CallExpression],
  filter: util.lengthAtPropGreaterThan("arguments", 0),
  mutator: util.dropEachOfProp("arguments"),
};

export default plugin;
