import R = require("ramda");
import S = require("../mutators/_syntax");

type LocationFilter = (m: MutantLocation) => boolean;

const isStringRequire = R.allPass([
  R.propEq("type", S.CallExpression),
  R.pathEq(["callee", "name"], "require"),
  R.pathEq(["arguments", "length"], 1),
  R.pathEq(["arguments", "0", "type"], S.Literal),
  // Ramda typings don't have R.pathSatisfies, but when they do:
  // R.pathSatisfies(R.is(String), ["arguments", "0", "type"])
  n => R.path(["arguments", "0", "type"], n) === "string"
]);

const isUseStrict = R.allPass([
  R.propEq("type", S.ExpressionStatement),
  R.pathEq(["expression", "value"], "use strict"),
]);

const filters: LocationFilter [] = [
  (m: MutantLocation) => !isUseStrict(m.node),
  (m: MutantLocation) => !isStringRequire(m.node),
];

export = R.allPass(filters);

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

