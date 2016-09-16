const expect = require("expect");

const updateIn = require("../../built/util/update-in");

// path val target
describe("updateIn", () => {

  const other = {};

  it("works with nested objects", () => {
    const target = {a: {b: {c: 1} }, d: other };
    const updated = updateIn(["a", "b", "c"], 2, target);
    expect(updated.a.b).toEqual({c: 2});
    expect(updated.d).toBe(other);
  });

  it("correctly handles arrays", () => {
    const target = {a: [{b: 1}, {c: 1}], d: other}
    const updated = updateIn(["a", 1, "c"], 2, target);
    expect(Array.isArray(updated.a)).toBe(true);
    expect(updated.a[1]).toEqual({c: 2});
    expect(updated.d).toEqual(other);
  });

});
