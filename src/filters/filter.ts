import * as R from "ramda";
import * as escodegen from "escodegen";

import S from "../mutators/_syntax";
import { MutantLocation } from "../types";
export const isStringRequire = R.allPass([
  R.propEq("type", S.CallExpression),
  R.pathEq(["callee", "name"], "require"),
  R.pathEq(["arguments", "length"], 1),
  R.pathEq(["arguments", "0", "type"], S.Literal),
  n => typeof R.path(["arguments", "0", "value"], n) === "string",
]);

export const isUseStrict = R.allPass([
  R.propEq("type", S.ExpressionStatement),
  R.pathEq(["expression", "value"], "use strict"),
]);

export const isCallOfName = (name: string) =>
  R.allPass([
    R.pathEq(["expression", "callee", "type"], "Identifier"),
    R.pathEq(["expression", "callee", "name"], name),
  ]);

export function nodeSourceIncludesText(text: string) {
  return (m: MutantLocation): boolean => {
    return escodegen.generate(m.node).includes(text);
  };
}

export function nodeSourceMatches(re: RegExp) {
  return (m: MutantLocation): boolean => {
    return re.test(escodegen.generate(m.node));
  };
}

export const isESModuleInterop = nodeSourceIncludesText(
  "Object.defineProperty(exports, '__esModule', { value: true });",
);
