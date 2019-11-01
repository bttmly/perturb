import S from "./_syntax";
import createMutatorPlugin from "../make-mutator-plugin";

// throw new Error(); => new Error();
// delete obj.x; => obj.x;
// typeof obj; => obj;
// +new Date(); => new Date();

export default createMutatorPlugin({
  name: "drop-operator",
  nodeTypes: [S.ThrowStatement, S.UnaryExpression],
  // TODO: ts-any
  mutator: (node: any) => node.argument,
});
