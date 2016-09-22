import R = require("ramda");
import esprima = require("esprima");

import * as escodegen from "escodegen";

const ESPRIMA_SETTINGS = {
  loc: true,
  attachComment: true,
};

type Locator = (n: ESTree.Node) => MutantLocation[];

function parse (locator: Locator, match: Match): ParsedMatch {
  try {
    const ast: ESTree.Node = esprima.parse(match.sourceCode, ESPRIMA_SETTINGS);
    const code: string = escodegen.generate(ast);
    const locations: MutantLocation[] = locator(ast);
    return Object.assign({}, match, { locations, ast, code });
  } catch (err) {
    // This really shouldn't happen -- we already ran the test suite and
    // presumably executed this file, so it should be valid JS.
    console.log("ERROR PARSING SOURCE FILE", match.source);
    throw err;
  }
}

export = R.curry(parse);
