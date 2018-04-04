import R = require("ramda");
import S = require("./_syntax");
import util = require("./util");
import { MutatorPlugin } from "../types"

// `var isOk = true` => `var isOk = false`
const plugin: MutatorPlugin = {
  name: "tweak-boolean-literal",
  nodeTypes: [S.Literal],
  filter: R.pipe(R.prop("value"), R.is(Boolean)),
  mutator: util.update("value", R.not),
}

export default plugin
