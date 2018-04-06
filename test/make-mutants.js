const S = require("estraverse").Syntax;
const esprima = require("esprima");
const escodegen = require("escodegen");
const expect = require("expect");

const mocks = require("./mocks/mutators");

const invertMutator = require("../built/mutators/conditional-test-invert")
  .default;
const locateMutants = require("../built/locate-mutants").default;
const makeMutants = require("../built/make-mutants").default;

describe("makeMutants", function() {
  it("generates mutant objects from a parsed match", function() {
    const locator = mocks.createMutatorLocator([invertMutator]);
    const locations = locateMutants(locator, ast);
    const parsedMatch = {
      source: "",
      tests: [""],
      sourceCode: source,
      ast: ast,
      code: escodegen.generate(ast),
      locations: locations,
    };
    const mutants = makeMutants(parsedMatch);
    expect(mutants.length).toBe(4);
    const withNotX = mutants.filter(m => m.mutatedSourceCode.includes("!x"));
    expect(withNotX.length).toBe(1);
    const withNotY = mutants.filter(m => m.mutatedSourceCode.includes("!y"));
    expect(withNotY.length).toBe(1);
    const withNotZ = mutants.filter(m => m.mutatedSourceCode.includes("!z"));
    expect(withNotZ.length).toBe(2);

    // verify mutants are well formed
    mutants.forEach(function(mutant) {
      expect(mutant.sourceFile).toEqual("");
      expect(mutant.testFiles).toEqual([""]);
      expect(mutant.path[0]).toEqual("body");
      // console.log(mutant.path);
      expect(mutant.mutatorName).toEqual("conditional-test-invert");
      expect(mutant.astAfter).toBeA(Object);
      expect(mutant.astBefore).toBeA(Object);
      expect(mutant.loc).toBeA(Object);
      expect(mutant.originalSourceCode).toBeA("string");
      expect(mutant.mutatedSourceCode).toBeA("string");
    });
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
