import R = require("ramda");
import S = require("./_syntax");
import util = require("./util");
import dropEachOfProp = require("../util/drop-each-of-prop");

export = <MutatorPlugin>{
  // drops the first declared element in an array literal
  // `['a', 'b']` => `['a']`
  name: "tweak-array-literal",
  nodeTypes: [S.ArrayExpression],
  mutator: util.dropEachOfProp("elements"),
};
