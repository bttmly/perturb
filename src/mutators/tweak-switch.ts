import S from "./_syntax";
import dropEachOfProp from "../util/drop-each-of-prop";
import { MutatorPlugin } from "../types";

const plugin: MutatorPlugin = {
  type: "mutator",
  name: "tweak-switch",
  nodeTypes: [S.SwitchStatement],
  mutator: dropEachOfProp("cases"),
};

export default plugin;
