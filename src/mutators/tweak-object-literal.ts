import R = require("ramda");
import S = require("./_syntax");
import dropEachOfProp = require("../util/drop-each-of-prop");

export = <MutatorPlugin>{
  // drops the first declared property in an object literal
  // `{prop1: "val1", prop2: "val2"}` => `{prop2: "val2"}`
  name: "tweak-object-literal",
  nodeTypes: [S.ObjectExpression],
  mutator: function (node): ESTree.Node[] {
    return dropEachOfProp("properties", node);
  },
};




