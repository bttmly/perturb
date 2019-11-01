import * as ESTree from "estree";
import { MutatorPlugin } from "../types";

import * as R from "ramda";

import conditionalTestAlways from "./conditional-test-always";
import conditionalTestInvert from "./conditional-test-invert";
import conditionalTestNever from "./conditional-test-never";
import dropMemberAssignment from "./drop-member-assignment";
import dropNode from "./drop-node";
import dropOperator from "./drop-operator";
import dropReturn from "./drop-return";
import dropVoidCall from "./drop-void-call";
import reverseFunctionParameters from "./reverse-function-parameters";
import swapBinaryOperators from "./swap-binary-operators";
import swapLogicalOperators from "./swap-logical-operators";
import tweakArguments from "./tweak-arguments";
import tweakArrayLiteral from "./tweak-array-literal";
import tweakBooleanLitearl from "./tweak-boolean-literal";
import tweakNumberLiteral from "./tweak-number-literal";
import tweakObjectLiteral from "./tweak-object-literal";
// import tweakStringLiteral from "./tweak-string-literal";
import tweakSwitch from "./tweak-switch";

interface MutatorPluginCtor {
  new(): MutatorPlugin;
}

const coreMutators: MutatorPluginCtor[] = [
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
];

interface MutatorIndex {
  [key: string]: MutatorPluginCtor[];
}

let index: MutatorIndex = {};
let activeMutators: MutatorPluginCtor[] = [];

// temporary stub -- this function will return false for disabled mutators (based on config)
function isMutatorEnabled(m: MutatorPluginCtor): boolean {
  return true;
}

// creating the internal state of this module should happen in the exported function
// so we can pass in config, which is necessary for filtering out disabled mutators

function makeMutatorIndex(names: string[]): MutatorIndex {
  const additionalMutators = locateMutatorPlugins(names);

  activeMutators = coreMutators
    .concat(additionalMutators)
    .filter(m => Object.keys(m).length > 0) // HACK :!
    .filter(isMutatorEnabled);

  const index: MutatorIndex = {};
  activeMutators.forEach((m) => {
    // if (process.env.ENFORCE_INVARIANTS) {
    //   let original = m.mutator;
    //   m.mutator = function (node: ESTree.Node) {
    //     return original(Object.freeze(node));
    //   }
    // }

    m.nodeTypes.forEach((type: string) => {
      if (index[type] == null) {
        index[type] = [];
      }
      index[type].push(m);
    });
  });
  return index;
}

function locateMutatorPlugins(
  names: string[],
  strict = false,
): MutatorPluginCtor[] {
  const plugins = names.map((name: string) => {
    try {
      const plugin: MutatorPluginCtor = require(`perturb-plugin-mutator-${name}`);
      return plugin;
    } catch (err) {
      // any way to recover? other locate strategy? something with local path resolution?
      console.log(
        `unable to locate -MUTATOR- plugin "${name}" -- fatal error, exiting`,
      );
      if (strict) throw err;
    }
    return;
  });

  return removeNils<MutatorPluginCtor>(plugins);
}

function removeNils<T>(arr: Array<T | null | void>): T[] {
  const xs: T[] = [];
  for (const item of arr) {
    if (item != null) xs.push(item);
  }
  return xs;
}

// exports.injectPlugins = function (names: string[]) {
//   index = locateMutatorPlugins(names);
// }

// exports.hasAvailableMutations = function (node: ESTree.Node): boolean {
//   if (node == null || node.type == null) return false;
//   return R.has(node.type, index);
// }

export function getMutatorsForNode(node: ESTree.Node): MutatorPlugin[] {
  if (node == null || node.type == null) return [];
  const plugins: MutatorPlugin[] = R.propOr([], node.type, index);
  return plugins;
}

export function getMutatorByName(name: string): MutatorPlugin | undefined {
  return activeMutators.find(m => m.name === name);
}

index = makeMutatorIndex([]);
