const R = require("ramda");
const { Syntax } = require("estraverse");

import { Skipper } from "../types";

function skipRequire (node: ESTree.Node): boolean {
  const funcNode = <ESTree.CallExpression>node;
  return (
    R.prop("type", node) === Syntax.CallExpression &&
    R.path(["callee", "name"], node) === "require" &&
    R.path(["arguments", "length"], node) === 1 &&
    R.path(["arguments", 0, "type"], node) === Syntax.Literal &&
    typeof R.path(["arguments", 0, "type"], node) === "string"
  );
}

function skipUseStrict (node: ESTree.Node): boolean {
  const exprNode = <ESTree.ExpressionStatement>node;
  return (
    exprNode.type === Syntax.ExpressionStatement &&
    R.path(["expression", "value"], exprNode) === "use strict"
  );
}

const skippers: Skipper[] = [ skipRequire, skipUseStrict ];

function injectPlugins (names) {
  names.forEach(function (name) {
    let plugin: Skipper;
    try {
      plugin = require(`perturb-plugin-skipper-${name}`);
      skippers.push(plugin);
    } catch (err) {
      // any way to recover? other locate strategy?
      console.log(`unable to locate -RUNNER- plugin "${name}" -- fatal error, exiting`);
      throw err;
    }
  });
}

export = function shouldSkip (node: ESTree.Node, path: string[]): boolean {
  return skippers.some(f => f(node, path));
}
