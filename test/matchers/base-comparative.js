const path = require("path");
const expect = require("expect");

const { makeConfig } = require("../helpers");

const plugin = require("../../lib/matchers/base-comparative").default;

let config, matcher, perturbDir, pTestDir, pSourceDir;
describe("base-comparative matcher", () => {
  beforeEach(() => {
    config = makeConfig();
    matcher = plugin.makeMatcher(config);
    perturbDir = path.join(config.projectRoot, config.perturbDir);
    pTestDir = path.join(perturbDir, config.testDir);
    pSourceDir = path.join(perturbDir, config.sourceDir);
  });

  it("has matchType 'comparative'", () => {
    expect(plugin.matchType).toBe("comparative");
  });

  it("matches same paths relative to source and test directories", () => {
    const source = path.join(pSourceDir, "some/long/file/path.js");
    const test = path.join(pTestDir, "some/long/file/path.js");
    expect(matcher(source, test)).toEqual(true);
  });

  it("rejects mismatched files", () => {
    const source = path.join(pSourceDir, "different/file/path.js");
    const test = path.join(pTestDir, "some/long/file/path.js");
    expect(matcher(source, test)).toEqual(false);
  });
});
