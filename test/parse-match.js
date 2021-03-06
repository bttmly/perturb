const expect = require("expect");

const mocks = require("./mocks/mutators");
const invertMutator = require("../lib/mutators/conditional-test-invert")
  .default;
const parseMatch = require("../lib/parse-match").default;
const locateMutants = require("../lib/locate-mutants").default;

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

const source = `
  var x, y, z;

  if (x) f()

  // perturb-disable: conditional-test-invert
  if (y) { if (z) { f() } }
  // perturb-enable: conditional-test-invert

  if (z) f()
`;
