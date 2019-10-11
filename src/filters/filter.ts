import * as R from "ramda";
import * as escodegen from "escodegen";
import { Node } from "estree";

import S from "../mutators/_syntax";

// export const isStringRequire = R.allPass([
//   R.propEq("type", S.CallExpression),
//   R.pathEq(["callee", "name"], "require"),
//   R.pathEq(["arguments", "length"], 1),
//   R.pathEq(["arguments", "0", "type"], S.Literal),
//   n => typeof R.path(["arguments", "0", "value"], n) === "string",
// ]);

export function isStringRequire(node: Node) {
  const result = (
    R.propEq("type", S.CallExpression, node) &&
    R.pathEq(["callee", "name"], "require", node) &&
    R.pathEq(["arguments", "length"], 1, node) &&
    R.pathEq(["arguments", "0", "type"], S.Literal, node) &&
    typeof R.path(["arguments", "0", "value"], node) === "string"
  );

  // if (result) {
  //   console.log(`dropped require ${escodegen.generate(node)}`)
  // }

  return result;
}

export const isUseStrict = R.allPass([
  R.propEq("type", S.ExpressionStatement),
  R.pathEq(["expression", "value"], "use strict"),
]);

export const isCallOfName = (name: string) => {
  return (node: Node) => {
    const result = (
      R.propEq("type", S.CallExpression, node) &&
      R.pathEq(["callee", "type"], S.Identifier, node) &&
      R.pathEq(["callee", "name"], name, node)
    )
    return result
  };
};

export function nodeSourceIncludes(text: string) {
  return (node: Node) => escodegen.generate(node).includes(text);
}

export function sourceNodeIncludesAny(texts: string[]) {
  return (node: Node) => {
    const code = escodegen.generate(node);
    return texts.some(t => code.includes(t));
  };
}

export function nodeSourceMatches(re: RegExp) {
  return (node: Node) => re.test(escodegen.generate(node));
}

export function sourceNodeMatchesAny(res: RegExp[]) {
  return (node: Node) => {
    const code = escodegen.generate(node);
    return res.some(re => re.test(code));
  };
}

export function sourceNodeIs(text: string) {
  return (node: Node) => escodegen.generate(node).trim() === text;
}

export const isESModuleInterop = nodeSourceIncludes(
  "Object.defineProperty(exports, '__esModule'",
);
