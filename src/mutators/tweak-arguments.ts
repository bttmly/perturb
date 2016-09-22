import R = require("ramda");
import S = require("./_syntax");
import util = require("./util");
import dropEachOfProp = require("../util/drop-each-of-prop");

// drops each argument to a function/method call in turn
// input: `fn(a, b, c)`
// output: [`fn(b, c)`, `fn(a, c)`, `fn(a, b)`]

export = <MutatorPlugin>{
  name: "tweak-arguments",
  nodeTypes: [S.CallExpression],
  filter: util.lengthAtPropGreaterThan("arguments", 0),
  mutator: util.dropEachOfProp("arguments"),
};
