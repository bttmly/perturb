import R = require("ramda");

type DropStrategy = "first" | "last" | "random"

const strategyMap = {
  first (node: ESTree.Node, key: string) {
    return R.assoc(key, node[key].slice(1), node);
  },
  last (node: ESTree.Node, key: string) {
    return R.assoc(key, node[key].slice(0, -1), node);
  },
  random (node: ESTree.Node, key: string) {
    return R.assoc(key, dropRandom(node[key]), node);
  },
}

function getRandomIndex (arr: any[]) {
  return Math.floor(Math.random() * (arr.length))
}

function dropRandom (arr: any[]) {
  return R.remove(getRandomIndex(arr), 1, arr);
}

export = function dropItemOfKey (node: ESTree.Node, key: string, strategy: DropStrategy) {
  return strategyMap[strategy](node, key);
}
