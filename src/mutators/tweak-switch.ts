import S = require("./_syntax");
import dropEachOfProp from "../util/drop-each-of-prop";
import { MutatorPlugin } from "../types";

const plugin: MutatorPlugin = {
  name: "tweak-switch",
  nodeTypes: [S.SwitchStatement],
  mutator: dropEachOfProp("cases"),
};

export default plugin;
