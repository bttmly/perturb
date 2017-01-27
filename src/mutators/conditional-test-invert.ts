import R = require("ramda");
import S = require("./_syntax");
import util = require("./util");

const BANG = "!";

// inverts a conditional test with a bang
// `if (isReady) {}` => `if (!(isReady)) {}`
// `while (arr.length) {} => `while(!(arr.length)) {}`
// `for (; i < 10; i++) {}` => `for(; (!(i < 10)); i++)`
export = <MutatorPlugin>{
  name: "invert-conditional-test",
  nodeTypes: S.TEST_NODES,
  filter: R.prop("test"),
  mutator: util.update(
    "test", test => ({
      type: S.UnaryExpression,
      operator: BANG,
      argument: test
    })
  ),
};
