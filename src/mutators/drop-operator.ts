import S from "./_syntax";
import { MutatorPlugin } from "../types";

// throw new Error(); => new Error();
// delete obj.x; => obj.x;
// typeof obj; => obj;
// +new Date(); => new Date();

const plugin: MutatorPlugin = {
  type: "mutator",
  name: "drop-operator",
  nodeTypes: [S.ThrowStatement, S.UnaryExpression],
  // TODO: ts-any
  mutator: (node: any) => node.argument,
};

export default plugin;
