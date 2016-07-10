const { Syntax } = require("estraverse");
const R = require("ramda");

import { MutatorPlugin } from "../types";

module.exports = <MutatorPlugin>{
  // drops the first declared property in an object literal
  // `{prop1: "val1", prop2: "val2"}` => `{prop2: "val2"}`
  name: "tweak-object-literal",
  nodeTypes: [Syntax.ObjectExpression],
  filter: function (node) {
    return R.path(["properties", "length"], node) !== 0;
  },
  mutator: function (node) {
    return strategies.dropFirst(<ESTree.ObjectExpression>node);
  },
};

// TODO -- DRY this up w/ array literal tweak mutator and string mutator

const strategies = {
  dropFirst: function(node: ESTree.ObjectExpression) {
    return R.assoc("properties", node.properties.slice(1), node);
  },
  dropLast: function(node: ESTree.ObjectExpression) {
    return R.assoc("properties", node.properties.slice(0, -1), node);
  },
  dropRandom: function(node: ESTree.ObjectExpression) {
    return R.assoc("properties", dropRandom(node.properties), node);
  }
}

function dropRandom (s) {
  const pos = Math.round(Math.random() * s.length - 1);
  return s.slice(0, pos) + s.slice(pos + 1);
}
