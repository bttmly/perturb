import some from "lodash.some";
import last from "lodash.last";

import NODE_TYPES from "../constants/node-types";
import JS_TYPES from "../constants/js-types";

import { Skipper } from "../types";

function skipRequire (node: ESTree.Node): boolean {
  const funcNode = <ESTree.CallExpression>node;
  return (
    funcNode.type === NODE_TYPES.CallExpression &&
    funcNode.callee.name === "require" &&
    funcNode.arguments.length === 1 &&
    funcNode.arguments[0].type === NODE_TYPES.Literal &&
    typeof funcNode.arguments[0].type === JS_TYPES.str
  );
}

function skipUseStrict (node: ESTree.Node): boolean {
  const exprNode = <ESTree.ExpressionStatement>node;
  return (
    exprNode.type === NODE_TYPES.ExpressionStatement &&
    exprNode.expression.value === "use strict"
  );
}

const skippers: Skipper[] = [ skipRequire, skipUseStrict ];

type Path = Array<string>

export function injectPlugins (names) {
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

export default function shouldSkip (node: ESTree.Node, path: Path): boolean {
  return skippers.some(f => f(node, path));
}
