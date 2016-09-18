function createNoopMutator (nodeTypes, filter) {
  return createMutator(nodeTypes, x => x, filter);
}

function createMutator (nodeTypes, mutator, filter) {
  return {
    name: "mock-mutator",
    nodeTypes,
    filter,
    mutator,
  }
}

// this is a bad name
function createMutatorLocator (mutators) {
  const index = {};
  mutators.forEach(m => {
    m.nodeTypes.forEach(function (type) {
      if (index[type] == null) index[type] = [];
      index[type].push(m);
    });
  });

  return function (node) {
    var result = index[node.type] || [];
    console.log("locator:", node.type, result);
    return result;
  }
}

const createPluginService = createMutatorLocator;

module.exports = {
  createNoopMutator,
  createMutator,
  createMutatorLocator,
  createPluginService,
}