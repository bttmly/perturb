import R = require("ramda");
import S = require("../mutators/_syntax");

function skipRequire (node: ESTree.Node): boolean {
  return (
    R.prop("type", node) === S.CallExpression &&
    R.path(["callee", "name"], node) === "require" &&
    R.path(["arguments", "length"], node) === 1 &&
    R.path(["arguments", "0", "type"], node) === S.Literal &&
    typeof R.path(["arguments", "0", "type"], node) === "string"
  );
}

function skipUseStrict (node: ESTree.Node): boolean {
  const exprNode = <ESTree.ExpressionStatement>node;
  return (
    exprNode.type === S.ExpressionStatement &&
    R.path(["expression", "value"], exprNode) === "use strict"
  );
}

const skippers: Skipper[] = [ skipRequire, skipUseStrict ];

// function injectPlugins (name) {
//   let plugin: Skipper;
//   try {
//     plugin = require(`perturb-plugin-skipper-${name}`);
//     skippers.push(plugin);
//   } catch (err) {
//     // any way to recover? other locate strategy?
//     console.log(`unable to locate -SKIPPER- plugin "${name}" -- fatal error, exiting`);
//     throw err;
//   }
// }

export = function shouldSkip (node: ESTree.Node, path: string[]): boolean {
  return skippers.some(f => f(node, path));
}
