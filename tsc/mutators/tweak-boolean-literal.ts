import NODE_TYPES from "../constants/node-types";
import NODE_ATTRS from "../constants/node-attrs";
import * as R from "ramda";
import { MutatorPlugin } from "../types";

// `var isOk = true` => `var isOk = false`
export default <MutatorPlugin>{
  name: "tweakBooleanLiteral",
  nodeTypes: [NODE_TYPES.Literal],
  filter: function (node) {
    const {value} = (<ESTree.Literal>node);
    return value === true || value === false;
  },
  mutator: function (node) {
    const {value} = (<ESTree.Literal>node);
    return R.assoc("value", !value, node);
  },
};
