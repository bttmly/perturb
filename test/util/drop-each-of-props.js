const expect = require("expect");

const dropEachOfProp = require("../../lib/util/drop-each-of-prop").default;

describe("dropEachOfProp", () => {
  const other = {};
  const example = { prop: [1, 2, 3], other };

  it("returns an array of object copies with items of prop dropped", () => {
    const result = dropEachOfProp("prop", example);
    expect(result[0].prop).toEqual([2, 3]);
    expect(result[0].other).toBe(other);
    expect(result[1].prop).toEqual([1, 3]);
    expect(result[1].other).toBe(other);
    expect(result[2].prop).toEqual([1, 2]);
    expect(result[2].other).toBe(other);
  });
});
