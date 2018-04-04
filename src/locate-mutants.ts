import R = require("ramda");
import CommentManager = require("./comments");
const estraverse = require("estraverse");

import * as ESTree from "estree";
import {
  MutatorPlugin,
  MutantLocation,
} from "./types"

// const debug = require("debug")("locate-mutants");f

type PluginService = (n: ESTree.Node) => MutatorPlugin[]

function locateMutants (mutatorsForNode: PluginService, ast: ESTree.Node): MutantLocation[] {
  const mutantLocations: MutantLocation[] = [];
  const manager = new CommentManager();
  const ctl = new estraverse.Controller()

  ctl.traverse(ast, {
    enter (node: ESTree.Node) {
      // debug("enter", node.type);
      manager.applyLeading(node);
      const path: string[] = ctl.path();
      const locations = mutatorsForNode(node)
        .filter(plugin => {
          return manager.isEnabled(plugin.name);
          // const status = manager.isEnabled(plugin.name);
          // if (!status) debug("disabled", plugin.name);
          // return status;
        })
        .filter(plugin => plugin.filter == null || plugin.filter(node))
        .map(plugin => ({node, path, mutator: plugin}));

      mutantLocations.push(...locations);
    },
    leave (node: ESTree.Node) {
      manager.applyTrailing(node);
    }
  });
  return mutantLocations;
}

export = R.curry(locateMutants);
