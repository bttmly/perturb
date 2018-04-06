import R = require("ramda");
import * as esprima from "esprima";

import * as ESTree from "estree";
import * as escodegen from "escodegen";
import { MutantLocation, ParsedMatch, Match } from "./types";

const ESPRIMA_SETTINGS = {
  loc: true,
  attachComment: true,
};

type Locator = (n: ESTree.Node) => MutantLocation[];

function parse(locator: Locator, match: Match): ParsedMatch {
  try {
    // TODO: try parseModule?
    const ast: ESTree.Node = esprimaParse(match.sourceCode);
    const code: string = escodegen.generate(ast);
    const locations: MutantLocation[] = locator(ast);
    return Object.assign({}, match, { locations, ast, code });
  } catch (err) {
    // This really shouldn't happen -- we already ran the test suite and
    // presumably executed this file, so it should be valid JS.
    // console.log("ERROR PARSING SOURCE FILE", match, err);
    throw err;
  }
}

export default R.curry(parse);

function esprimaParse(source: string) {
  try {
    return esprima.parseScript(source, ESPRIMA_SETTINGS);
  } catch (err1) {
    return esprima.parseModule(source, ESPRIMA_SETTINGS);
  }
}
