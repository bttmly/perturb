import R = require("ramda");
import S = require("./_syntax");
import util = require("./util");

const BINARY_OPERATOR_SWAPS = require("../constants/binary-operator-swaps");

// swaps [+, -] and [*, /]
// `age = age + 1;` => `age = age - 1;`
// `var since = new Date() - start;` => `var since = new Date() + start;`
// `var dy = rise / run;` => `var dy = rise * run;`
// `var area = w * h;` => `var area = w / h;`
export = <MutatorPlugin>{
  name: "swap-binary-operators",
  nodeTypes: [S.BinaryExpression],
  filter: R.pipe(
    R.prop("operator"),
    R.flip(R.has)(BINARY_OPERATOR_SWAPS)
  ),
  mutator: util.update("operator", op => BINARY_OPERATOR_SWAPS[op])
};
