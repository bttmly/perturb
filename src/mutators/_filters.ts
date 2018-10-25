import * as R from "ramda";
import { NodeFilter } from "../types";
import * as escodegen from "escodegen";
import S from "../mutators/_syntax";

export function hasProp(prop: string): NodeFilter {
  return node => {
    return R.prop(prop, node as any) != null;
  };
}

export const isCallOfName = (name: string): NodeFilter => {
  return node => {
    if (!R.propEq("type", S.CallExpression, node)) return false;
    if (!R.pathEq(["callee", "type"], S.Identifier, node)) return false;
    if (!R.pathEq(["callee", "name"], name, node)) return false;
    return true;
  };
};

export function nodeSourceIncludes(text: string): NodeFilter {
  return node => escodegen.generate(node).includes(text);
}

export function sourceNodeIncludesAny(texts: string[]): NodeFilter {
  return node => {
    const code = escodegen.generate(node);
    return texts.some(t => code.includes(t));
  };
}

export function nodeSourceMatches(re: RegExp): NodeFilter {
  return node => re.test(escodegen.generate(node));
}

export function sourceNodeMatchesAny(res: RegExp[]): NodeFilter {
  return node => {
    const code = escodegen.generate(node);
    return res.some(re => re.test(code));
  };
}

export function sourceNodeIs(text: string): NodeFilter {
  return node => escodegen.generate(node).trim() === text;
}

export const isESModuleInterop = nodeSourceIncludes(
  "Object.defineProperty(exports, '__esModule', { value: true });",
);
