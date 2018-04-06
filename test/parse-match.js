const S = require("estraverse").Syntax;
const esprima = require("esprima");
const escodegen = require("escodegen");
const expect = require("expect");

const mocks = require("./mocks/mutators");
const invertMutator = require("../built/mutators/conditional-test-invert")
  .default;
const parseMatch = require("../built/parse-match").default;
const locateMutants = require("../built/locate-mutants").default;

describe("parseMatch", function() {
  it("generates a parsed match from a basic match", function() {
    const pluginService = mocks.createPluginService([invertMutator]);
    const locator = locateMutants(pluginService);

    const match = {
      source: "",
      tests: [""],
      sourceCode: source,
    };
    const parsedMatch = parseMatch(locator, match);
    expect(match).toNotBe(parsedMatch); // no mutation
    expect(parsedMatch.source).toBe(match.source);
    expect(parsedMatch.tests).toBe(match.tests);
    expect(parsedMatch.sourceCode).toBe(match.sourceCode);
    expect(parsedMatch.locations.length).toBe(2);
    expect(parsedMatch.ast).toBeA(Object);
    expect(parsedMatch.code).toBeA("string");
    expect(parsedMatch.locations[0].node.loc).toBeA(Object);
  });
});

const ESPRIMA_SETTINGS = {
  loc: true,
  attachComment: true,
};

const source = `
  var x, y, z;

  if (x) f()

  // perturb-disable: conditional-test-invert
  if (y) { if (z) { f() } }
  // perturb-enable: conditional-test-invert

  if (z) f()
`;

const ast = esprima.parse(source, ESPRIMA_SETTINGS);
