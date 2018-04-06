const expect = require("expect");

const updateIn = require("../../built/util/update-in").default;

describe("updateIn", () => {
  const other = {};

  it("works with nested objects", () => {
    const target = { a: { b: { c: 1 } }, d: other };
    const updated = updateIn(["a", "b", "c"], 2, target);
    expect(updated.a.b).toEqual({ c: 2 });
    expect(updated.d).toBe(other);
  });

  it("correctly handles arrays", () => {
    const target = { a: [{ b: 1 }, { c: 1 }], d: other };
    const updated = updateIn(["a", 1, "c"], 2, target);
    expect(Array.isArray(updated.a)).toBe(true);
    expect(updated.a[1]).toEqual({ c: 2 });
    expect(updated.d).toEqual(other);
  });

  it("returns the object unchanged when path length is zero", () => {
    const target = {};
    const updated = updateIn([], null, target);
    expect(target).toBe(updated);
  });

  it("does the path length 1 case properly", () => {
    const target = { a: 1, b: other };
    const updated = updateIn(["a"], 2, target);
    expect(updated.a).toBe(2);
    expect(updated.b).toBe(other);
  });
});
