import * as ESTree from "estree"

export function hasProp (prop: string) {
  return (node: ESTree.Node) => node.hasOwnProperty(prop)
}