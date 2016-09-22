import R = require("ramda");
import S = require("./_syntax");
import util = require("./util");

export = <MutatorPlugin>{
  // drops the first declared property in an object literal
  // `{prop1: "val1", prop2: "val2"}` => `{prop2: "val2"}`
  name: "tweak-object-literal",
  nodeTypes: [S.ObjectExpression],
  filter: util.lengthAtPropGreaterThan("properties", 0),
  mutator: util.dropEachOfProp("properties"),
};




