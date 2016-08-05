import R = require("ramda");
import S = require("./_syntax");
import dropEachOfProp = require("../util/drop-each-of-prop");

// drops each argument to a function/method call in turn
// input: `fn(a, b, c)`
// output: [`fn(b, c)`, `fn(a, c)`, `fn(a, b)`]

export = <MutatorPlugin>{
  name: "tweak-arguments",
  nodeTypes: [S.CallExpression],
  filter: function (node) {
    return R.path(["arguments", "length"], node) !== 0;
  },
  mutator: function (node): ESTree.Node[] {
    return dropEachOfProp("arguments", node);
  },
};
