const S = require("estraverse").Syntax;
const esprima = require("esprima");
const escodegen = require("escodegen");
const expect = require("expect");

const mocks = require("./mocks/mutators");
const invertMutator = require("../built/mutators/invert-conditional-test");
const parseMatch = require("../built/parse-match");
const locateMutants = require("../built/locate-mutants");

describe("parseMatch", function () {

  it("generates a parsed match from a basic match", function () {
    const pluginService = mocks.createPluginService([invertMutator]);
    const locator = locateMutants(pluginService);

    const match = {
      source: "",
      tests: [""],
      sourceCode: source,
    };
    const parsedMatch = parseMatch(locator, match);
    expect(parsedMatch.locations.length).toBe(4);
  });

});


const ESPRIMA_SETTINGS = {
  loc: true,
  comment: true,
  attachComment: true,
};

const source = `
  var x, y, z;

  if (x) {}

  if (y) { if (z) {} }

  if (z) {}
`;

const ast = esprima.parse(source, ESPRIMA_SETTINGS);

