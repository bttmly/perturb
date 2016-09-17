function createNoopMutator (nodeTypes, filter) {
  return {
    name: "noop-mutator",
    nodeTypes,
    filter,
    mutator (node) { return node; },
  }
}

function createMutatorLocator (mutators) {
  const index = {};
  mutators.forEach(m => {
    m.nodeTypes.forEach(function (type) {
      if (index[type] == null) index[type] = [];
      index[type].push(m);
    });
  });

  return function (node) {
    return index[node.type] || [];
  }
}

module.exports = { createNoopMutator, createMutatorLocator }