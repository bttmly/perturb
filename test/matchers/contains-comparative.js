const path = require("path");
const expect = require("expect");

const { makeConfig } = require("../helpers");

const plugin = require("../../lib/matchers/contains-comparative").default;

let config, matcher, perturbDir;
describe("contains-comparative matcher", function () {
  beforeEach(function () {
    config = makeConfig();
    matcher = plugin.makeMatcher(config);
    perturbDir = path.join(config.projectRoot, config.perturbDir);
    pTestDir = path.join(perturbDir, config.testDir);
    pSourceDir = path.join(perturbDir, config.sourceDir);
  });

  it("has matchType 'comparative'", function () {
    expect(plugin.matchType).toBe("comparative");
  });

  it("matches same paths relative to source and test directories", function () {
    const source = path.join(pSourceDir, "some/long/file/path.js");
    const test = path.join(pTestDir, "some/long/file/path.js");
    expect(matcher(source, test)).toEqual(true);
  });

  it("allows trailing extra characters for test files", function () {
    const source = path.join(pSourceDir, "some/long/file/path.js");
    const test = path.join(pTestDir, "some/long/file/path-test.js");
    expect(matcher(source, test)).toEqual(true);
  });

  it("ignores file extensions", function () {
    const source = path.join(pSourceDir, "some/long/file/path.zxcv");
    const test = path.join(pTestDir, "some/long/file/path-test.asdf");
    expect(matcher(source, test)).toEqual(true);
  });
});
