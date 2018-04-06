import * as R from "ramda";
import S from "./_syntax";
import * as ESTree from "estree";
import { MutatorPlugin } from "../types";

const EMPTY_REPLACEMENT = "a";

const plugin: MutatorPlugin = {
  // drops first character of non-empty string; changes
  // empty strings to "a"
  // var s = ""; => var s = "a";
  // var name = "nick"; => var name = "ick";
  name: "tweak-string-literal",
  nodeTypes: [S.Literal],
  filter(node) {
    return typeof (node as ESTree.Literal).value === "string";
  },
  mutator(node) {
    const value = (node as ESTree.Literal).value as string;
    const replacement = value.length ? value.slice(1) : EMPTY_REPLACEMENT;
    return R.assoc("value", replacement, node);
  },
};

export default plugin;
