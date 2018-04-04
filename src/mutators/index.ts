import * as ESTree from "estree"
import { MutatorPlugin } from "../types"

import R = require("ramda");

import conditionalTestAlways = require("./conditional-test-always");
import conditionalTestInvert = require("./conditional-test-invert");
import conditionalTestNever = require("./conditional-test-never")
import dropMemberAssignment = require("./drop-member-assignment");
import dropNode = require("./drop-node");
import dropOperator = require("./drop-node");
import dropReturn = require("./drop-return");
import dropVoidCall = require("./drop-void-call");
import reverseFunctionParameters = require("./reverse-function-parameters");
import swapBinaryOperators = require("./swap-binary-operators");
import swapLogicalOperators = require("./swap-logical-operators");
import tweakArguments = require("./tweak-arguments");
import tweakArrayLiteral = require("./tweak-array-literal");
import tweakBooleanLitearl = require("./tweak-boolean-literal");
import tweakNumberLiteral = require("./tweak-number-literal");
import tweakObjectLiteral = require("./tweak-object-literal");
// import tweakStringLiteral = require("./tweak-string-literal");
import tweakSwitch = require("./tweak-switch");

const coreMutators: MutatorPlugin[] = [
  conditionalTestAlways,
  conditionalTestInvert,
  conditionalTestNever,
  dropMemberAssignment,
  dropNode,
  dropOperator,
  dropReturn,
  dropVoidCall,
  reverseFunctionParameters,
  swapBinaryOperators,
  swapLogicalOperators,
  tweakArguments,
  tweakArrayLiteral,
  tweakBooleanLitearl,
  tweakNumberLiteral,
  tweakObjectLiteral,
  // tweakStringLiteral,
  tweakSwitch,
]

type MutatorIndex = { [key: string]: MutatorPlugin[] };

let index: MutatorIndex = {};
let activeMutators: MutatorPlugin[] = [];

// temporary stub -- this function will return false for disabled mutators (based on config)
function isMutatorEnabled (m: MutatorPlugin): boolean {
  return true;
}

// creating the internal state of this module should happen in the exported function
// so we can pass in config, which is necessary for filtering out disabled mutators

function makeMutatorIndex (names: string[]): MutatorIndex {
  const additionalMutators = locateMutatorPlugins(names);

  activeMutators = coreMutators.concat(additionalMutators)
    .filter(m => Object.keys(m).length > 0) // HACK :!
    .filter(isMutatorEnabled);

  const index: MutatorIndex = {};
  activeMutators.forEach(function (m: MutatorPlugin) {

    // if (process.env.ENFORCE_INVARIANTS) {
    //   let original = m.mutator;
    //   m.mutator = function (node: ESTree.Node) {
    //     return original(Object.freeze(node));
    //   }
    // }

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
    try {
      return <MutatorPlugin>require(`perturb-plugin-mutator-${name}`)
    } catch (err) {
      // any way to recover? other locate strategy? something with local path resolution?
      console.log(`unable to locate -MUTATOR- plugin "${name}" -- fatal error, exiting`);
      throw err;
    }
  });
}

// exports.injectPlugins = function (names: string[]) {
//   index = locateMutatorPlugins(names);
// }

// exports.hasAvailableMutations = function (node: ESTree.Node): boolean {
//   if (node == null || node.type == null) return false;
//   return R.has(node.type, index);
// }

function getMutatorsForNode (node: ESTree.Node): MutatorPlugin[] {
  if (node == null || node.type == null) return [];
  return <MutatorPlugin[]>R.propOr([], node.type, index);
}

function getMutatorByName (name: string): MutatorPlugin | undefined {
  return activeMutators.find(m => m.name === name);
}

index = makeMutatorIndex([]);

export = { getMutatorsForNode, getMutatorByName };
