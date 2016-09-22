import R = require("ramda");
import S = require("./_syntax");
import util = require("./util");

// `var isOk = true` => `var isOk = false`
export = <MutatorPlugin>{
  name: "tweak-boolean-literal",
  nodeTypes: [S.Literal],
  filter: R.pipe(R.prop("value"), R.is(Boolean)),
  mutator: util.update("value", v => !v),
};
