const R = require("ramda");

import {
  MutatorPlugin
} from "../types";

const coreMutators: MutatorPlugin[] = [
  require("./drop-member-assignment"),
  require("./drop-node"),
  require("./drop-operator"),
  require("./drop-return"),
  require("./drop-void-call"),
  require("./invert-conditional-test"),
  require("./reverse-function-parameters"),
  require("./swap-binary-operators"),
  require("./swap-logical-operators"),
  require("./tweak-array-literal"),
  require("./tweak-object-literal"),
  require("./tweak-boolean-literal"),
  require("./tweak-number-literal"),
  require("./tweak-string-literal"),
];

let mutatorIndex = {}
let activeMutators = []

// temporary stub -- this function will return false for disabled mutators (based on config)
function isMutatorEnabled (m: MutatorPlugin): boolean {
  return true;
}

// temporary stub -- plugin mutators will go into this array
// const mutatorPlugins: Array<Mutator> = [];

// creating the internal state of this module should happen in the exported function
// so we can pass in config, which is necessary for filtering out disabled mutators

function makeMutatorIndex (names: string[]) {
  const additionalMutators = locateMutatorPlugins(names);
  
  activeMutators = coreMutators.concat(additionalMutators)
    .filter(m => Object.keys(m).length > 0) // HACK :!
    .filter(isMutatorEnabled);

  // const index : { string: MutatorPlugin[] } = {};
  const index = {};
  activeMutators.forEach(function (m: MutatorPlugin) {

    if (m.nodeTypes == null) {
      console.log(m);
    }

    m.nodeTypes.forEach(function (type: string) {
      if (index[type] == null) {
        index[type] = []
      }
      index[type].push(m);
    });
  });
  return index;
}

function locateMutatorPlugins (names: string[]): MutatorPlugin[] {
  return names.map(function (name: string): MutatorPlugin {
    let plugin: MutatorPlugin;
    try {
      plugin = require(`perturb-plugin-mutator-${name}`);
      return plugin;
    } catch (err) {
      // any way to recover? other locate strategy?
      console.log(`unable to locate -MUTATOR- plugin "${name}" -- fatal error, exiting`);
      throw err;
    }
  });
}

exports.injectPlugins = function (names: string[]) {
  mutatorIndex = locateMutatorPlugins(names);
}

exports.hasAvailableMutations = function (node: ESTree.Node): boolean {
  if (node == null || node.type == null) return false;
  return R.has(node.type, mutatorIndex);
}

exports.getMutatorsForNode = function (node: ESTree.Node): MutatorPlugin[] {
  if (node == null || node.type == null) return [];
  return R.propOr([], node.type, mutatorIndex);
}

exports.getMutatorByName = function (name: string): MutatorPlugin {
  return activeMutators.find(m => m.name === name);
}

mutatorIndex = makeMutatorIndex([]);
