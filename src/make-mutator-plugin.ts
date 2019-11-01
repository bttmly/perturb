import { MutatorPlugin } from "./types";
import * as ESTree from "estree";

interface MutatorPluginCtor {
  new(): MutatorPlugin;
}

export default function createMutatorPlugin(opts: Omit<MutatorPlugin, "type">): MutatorPluginCtor {
  return class implements MutatorPlugin {
    readonly type = "mutator";
    readonly name = opts.name;
    readonly nodeTypes = opts.nodeTypes;
    readonly _mutator = opts.mutator;
    readonly filter = opts.filter;
    mutator(node: ESTree.Node) {
      return toArray(this._mutator(node))
    }
  }
}

const toArray = <T>(x: T | T[]) => (Array.isArray(x) ? x : [x]);