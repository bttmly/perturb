import S = require("./_syntax");
import { MutatorPlugin } from "../types";

// throw new Error(); => new Error();
// delete obj.x; => obj.x;
// typeof obj; => obj;
// +new Date(); => new Date();

const plugin: MutatorPlugin = {
  name: "drop-operator",
  nodeTypes: [S.ThrowStatement, S.UnaryExpression],
  // TODO: ts-any
  mutator: (node: any) => node.argument,
};

export default plugin;
