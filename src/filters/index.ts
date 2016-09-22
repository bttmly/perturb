import R = require("ramda");
import S = require("../mutators/_syntax");

type LocationFilter = (m: MutantLocation) => boolean;

const isStringRequire = R.allPass([
  R.propEq("type", S.CallExpression),
  R.pathEq(["callee", "name"], "require"),
  R.pathEq(["arguments", "length"], 1),
  R.pathEq(["arguments", "0", "type"], S.Literal),
  n => typeof R.path(["arguments", "0", "value"], n) === "string"
]);

const isUseStrict = R.allPass([
  R.propEq("type", S.ExpressionStatement),
  R.pathEq(["expression", "value"], "use strict"),
]);

// const isCallOfName = (name: string) => R.allPass([
//   R.pathEq(["expression", "callee", "type"], "Identifier"),
//   R.pathEq(["expression", "callee", "name"], name),
// ]);

const filters: LocationFilter [] = [
  (m: MutantLocation) => !isUseStrict(m.node),
  (m: MutantLocation) => !isStringRequire(m.node),
  // (m: MutantLocation) => !isCallOfName("debug")(m.node),
];

export = R.allPass(filters);

// TODO -- how to expose this?
function inject (name) {
  let plugin: LocationFilter;
  try {
    plugin = require(`perturb-plugin-skipper-${name}`);
    filters.push(plugin);
  } catch (err) {
    // any way to recover? other locate strategy?
    console.log(`unable to locate -FILTER- plugin "${name}" -- fatal error, exiting`);
    throw err;
  }
}

