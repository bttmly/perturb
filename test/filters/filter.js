const filters = require("../../lib/filters/filter");
const esprima = require("esprima");
const expect = require("expect");
const R = require("ramda");

const esModuleInterop = "Object.defineProperty(exports, '__esModule', { value: true });"

const callFn = "fn(1, 2, 3);"

describe("filter", () => {

  describe("#isStringRequire", () => {
    const notRejected = [
      "require('abc', 123)",
      "reqired('abc')",
      "require(123)",
      "require({})",
    ]

    for (const code of notRejected) {
      it(`rejects \`${code}\``, () => {
        const node = extractExpression(parseToLocation(code));
        expect(filters.isStringRequire(node)).toBe(false);
      })
    }

    it("accepts properly", () => {
      const valid = "require('abc')";
      const node = extractExpression(parseToLocation(valid));
      expect(filters.isStringRequire(node)).toBe(true);
    })
  })

  describe("#nodeSourceMatchesText", () => {
    it("works", () => {
      const loc = parseToLocation(esModuleInterop);
      expect(filters.isESModuleInterop(loc.node)).toBe(true);
    })
  });

  describe("#isCallOfname", () => {
    it("works", () => {
      const loc = parseToLocation(callFn);
      offsetLocation(loc, ["expression"])
      expect(filters.isCallOfName("fn")(loc.node)).toBe(true);
      expect(filters.isCallOfName("fun")(loc.node)).toBe(false);
    })
  });
})

function parseToLocation(text) {
  const program = esprima.parseModule(text);
  if (program.body.length === 0) throw new Error(`Did not create program with zero body statements: ${text}`)
  if (program.body.length > 1) throw new Error(`Created program withmore than one body statement: ${text}`)
  return {
    mutator: null, // TODO: if we start using filters that check the mutator
    path: [],
    node: program.body[0],
  }
}

// helper to descend into the node to be on the right top level node for a test
function offsetLocation(loc, path) {
  loc.node = R.path(path, loc.node);
  return loc;
}

function extractExpression({ node }) {
  if (Object.keys(node).length !== 2) throw new Error("expected two keys");
  if (node.type !== "ExpressionStatement") throw new Error("expected type to be ExpressionStatement")
  return node.expression;
}