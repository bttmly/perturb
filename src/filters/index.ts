import R = require("ramda");
import S = require("../mutators/_syntax");

function filterSimpleRequire (m: MutantLocation): boolean {
  return !(
    R.prop("type", m.node) === S.CallExpression &&
    R.path(["callee", "name"], m.node) === "require" &&
    R.path(["arguments", "length"], m.node) === 1 &&
    R.path(["arguments", "0", "type"], m.node) === S.Literal &&
    typeof R.path(["arguments", "0", "type"], m.node) === "string"
  );
}

function filterUseStrict (m: MutantLocation): boolean {
  const exprNode = <ESTree.ExpressionStatement>m.node;
  return !(
    exprNode.type === S.ExpressionStatement &&
    R.path(["expression", "value"], exprNode) === "use strict"
  );
}

type LocationFilter = (n: MutantLocation) => boolean;
const filters: LocationFilter[] = [ filterSimpleRequire, filterUseStrict ];

export = function filter (m: MutantLocation) {
  return filters.every(f => f(m));
}

// export function inject (name) {
//   let plugin: LocationFilter;
//   try {
//     plugin = require(`perturb-plugin-skipper-${name}`);
//     filters.push(plugin);
//   } catch (err) {
//     // any way to recover? other locate strategy?
//     console.log(`unable to locate -FILTER- plugin "${name}" -- fatal error, exiting`);
//     throw err;
//   }
// }

