///<reference path="../../typings/modules/ramda/index.d.ts"/>

// extra block-scope hack to account for "error TS2451: Cannot redeclare block-scoped variable 'R'" (???)
{

const R = require("ramda");

type DropStrategy = "first" | "last" | "random"

const strategyMap = {
  first: function(node: ESTree.Node, key: string) {
    return R.assoc(key, node[key].slice(1), node);
  },
  last: function(node: ESTree.Node, key: string) {
    return R.assoc(key, node[key].slice(0, -1), node);
  },
  random: function(node: ESTree.Node, key: string) {
    return R.assoc(key, dropRandom(node[key]), node);
  },
}

function getRandomIndex (arr: any[]) {
  return Math.floor(Math.random() * (arr.length))
}

function dropRandom (arr: any[]) {
  return R.remove(getRandomIndex(arr), 1, arr);
}

function dropItemOfKey (node: ESTree.Node, key: string, strategy: DropStrategy) {
  return strategyMap[strategy](node, key);
}

module.exports = dropItemOfKey;

}