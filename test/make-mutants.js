const S = require("estraverse").Syntax;
const esprima = require("esprima");
const escodegen = require("escodegen");
const expect = require("expect");

const mocks = require("./mocks/mutators");

const invertMutator = require("../built/mutators/invert-conditional-test");
const locateMutants = require("../built/locate-mutants");
const makeMutants = require("../built/make-mutants");

describe("makeMutants", function () {

  it("generates mutant objects from a parsed match", function () {
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
    withNotX = mutants.filter(m => m.mutatedSourceCode.includes("!x"))
    expect(withNotX.length).toBe(1);
    withNotY = mutants.filter(m => m.mutatedSourceCode.includes("!y"))
    expect(withNotY.length).toBe(1);
    withNotZ = mutants.filter(m => m.mutatedSourceCode.includes("!z"))
    expect(withNotZ.length).toBe(2);

    expect(mutants[0].sourceFile).toEqual("")
    expect(mutants[0].testFiles).toEqual([""])
    expect(mutants[0].path).toEqual(["body", 1])
    expect(mutants[0].mutatorName).toEqual("invert-conditional-test");
    expect(mutants[0].astAfter).toBeA(Object);
    expect(mutants[0].astBefore).toBeA(Object);
    expect(mutants[0].loc).toBeA(Object);
    expect(mutants[0].originalSourceCode).toBeA("string");
    expect(mutants[0].mutatedSourceCode).toBeA("string");
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

