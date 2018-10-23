const filters = require("../../lib/filters/filter");
const esprima = require("esprima");
const expect = require("expect");
<<<<<<< HEAD
const R = require("ramda");

const esModuleInterop = "Object.defineProperty(exports, '__esModule', { value: true });"

const callFn = "fn(1, 2, 3);"

=======

const esModuleInterop = "Object.defineProperty(exports, '__esModule', { value: true });"

>>>>>>> ground work for expanding filter implementations
describe("filter", () => {

  describe("#nodeSourceMatchesText", () => {
    it("works", () => {
      const loc = parseToLocation(esModuleInterop);
      expect(filters.isESModuleInterop(loc)).toBe(true);
    })
  });

<<<<<<< HEAD
  describe("#isCallOfname", () => {
    it("works", () => {
      const loc = parseToLocation(callFn);
      offsetLocation(loc, [ "expression" ])
      expect(filters.isCallOfName("fn")(loc)).toBe(true);
      expect(filters.isCallOfName("fun")(loc)).toBe(false);
    })
  });

=======
>>>>>>> ground work for expanding filter implementations
})

function parseToLocation (text) {
  const program = esprima.parseModule(text);
  if (program.body.length === 0) throw new Error(`Did not create program with zero body statements: ${text}`)
  if (program.body.length === 0) throw new Error(`Created program withmore than one body statement: ${text}`)
  return {
<<<<<<< HEAD
    mutator: null, // TODO: if we start using filters that check the mutator
=======
    mutator: null, // TODO: if we start using filters that check the mutatot
>>>>>>> ground work for expanding filter implementations
    path: [],
    node: program.body[0],
  }
}

<<<<<<< HEAD
// helper to descend into the node to be on the right top level node for a test
function offsetLocation (loc, path) {
  loc.node = R.path(path, loc.node);
  return loc;
}
=======
>>>>>>> ground work for expanding filter implementations
