import * as R from "ramda";
import * as escodegen from "escodegen";
import S from "../mutators/_syntax";
import { LocationFilter } from "../types";

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

export const isCallOfName = (name: string): LocationFilter => {
  return ({ node }) => {
    if (!R.propEq("type", S.CallExpression, node)) return false;
    if (!R.pathEq(["callee", "type"], S.Identifier, node)) return false;
    if (!R.pathEq(["callee", "name"], name, node)) return false;
    return true;
  };
};

export function nodeSourceIncludes(text: string): LocationFilter {
  return ({ node }) => {
    return escodegen.generate(node).includes(text);
  };
}

export function sourceNodeIncludesAny(texts: string[]): LocationFilter {
  return ({ node }) => {
    const code = escodegen.generate(node);
    return texts.some(t => code.includes(t));
  };
}

export function nodeSourceMatches(re: RegExp): LocationFilter {
  return ({ node }) => {
    return re.test(escodegen.generate(node));
  };
}

export function sourceNodeMatchesAny(res: RegExp[]): LocationFilter {
  return ({ node }) => {
    const code = escodegen.generate(node);
    return res.some(re => re.test(code));
  };
}

export function sourceNodeIs(text: string): LocationFilter {
  return ({ node }) => {
    return escodegen.generate(node).trim() === text;
  };
}

export const isESModuleInterop = nodeSourceIncludes(
  "Object.defineProperty(exports, '__esModule', { value: true });",
);
