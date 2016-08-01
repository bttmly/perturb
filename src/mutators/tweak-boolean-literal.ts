import R = require("ramda");
import S = require("./_syntax");

// `var isOk = true` => `var isOk = false`
export = <MutatorPlugin>{
  name: "tweak-boolean-literal",
  nodeTypes: [S.Literal],
  filter: function (node) {
    const {value} = (<ESTree.Literal>node);
    return value === true || value === false;
  },
  mutator: function (node) {
    const {value} = (<ESTree.Literal>node);
    return R.assoc("value", !value, node);
  },
};
