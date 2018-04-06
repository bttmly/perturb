import * as R from "ramda";
import S from "./_syntax";
import * as util from "./util";
import { MutatorPlugin } from "../types";

// `var isOk = true` => `var isOk = false`
const plugin: MutatorPlugin = {
  name: "tweak-boolean-literal",
  nodeTypes: [S.Literal],
  filter(node: any) {
    return typeof node.value === "boolean";
  },
  mutator: util.update("value", R.not),
};

export default plugin;
