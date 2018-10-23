const filters = require("../../lib/filters/filter");
const esprima = require("esprima");
const expect = require("expect");

const esModuleInterop = "Object.defineProperty(exports, '__esModule', { value: true });"

describe("filter", () => {

  describe("#nodeSourceMatchesText", () => {
    it("works", () => {
      const loc = parseToLocation(esModuleInterop);
      expect(filters.isESModuleInterop(loc)).toBe(true);
    })
  });

})

function parseToLocation (text) {
  const program = esprima.parseModule(text);
  if (program.body.length === 0) throw new Error(`Did not create program with zero body statements: ${text}`)
  if (program.body.length === 0) throw new Error(`Created program withmore than one body statement: ${text}`)
  return {
    mutator: null, // TODO: if we start using filters that check the mutatot
    path: [],
    node: program.body[0],
  }
}

