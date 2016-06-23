"use strict";

import NODE_TYPES from "../constants/node-types";
import NODE_ATTRS from "../constants/node-attrs";
import * as R from "ramda";
import { MutatorPlugin } from "../types";

export default <MutatorPlugin>{
  // drops the first declared element in an array literal
  // `['a', 'b']` => `['a']`
  name: "tweakArrayLiteral",
  nodeTypes: [NODE_TYPES.ArrayExpression],
  filter: function (node) {
    return R.path(["elements", "length"], node) !== 0;
  },
  mutator: function (node) {
    return strategies.dropFirst(<ESTree.ArrayExpression>node);
  },
};

const strategies = {
  dropFirst: function (node: ESTree.ArrayExpression) {
    return R.assoc("elements", node.elements.slice(1), node);
  },
  dropLast: function (node: ESTree.ArrayExpression) {
    return R.assoc("elements", node.elements.slice(0, -1), node);
  },
  dropRandom: function (node: ESTree.ArrayExpression) {
    return R.assoc("elements", dropRandom(node.elements), node);
  }
}

function dropRandom(arr) {
  var i = getRandomIndex(arr);
  var out = arr.slice();
  out.splice(i, 1);
  return out;
}

function getRandomIndex(arr) {
  return Math.floor(Math.random() * (arr.length))
}
