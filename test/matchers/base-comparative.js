const path = require("path");
const expect = require("expect");

const { makeConfig } = require("../helpers");

const plugin = require("../../built/matchers/base-comparative");

let config, matcher, perturbDir;
describe("base-comparative matcher", function () {
  
  beforeEach(function () {
    config = makeConfig();
    matcher = plugin.makeMatcher(config);
    perturbDir = path.join(config.projectRoot, config.perturbDir);
    pTestDir = path.join(perturbDir, config.testDir);
    pSourceDir = path.join(perturbDir, config.sourceDir);
  });

  it("has type 'comparative'", function () {
    expect(plugin.type).toEqual("comparative");
  });

  it("matches same paths relative to source and test directories", function () {
    const source = path.join(pSourceDir, "some/long/file/path.js");
    const test = path.join(pTestDir, "some/long/file/path.js");
    expect(matcher(source, test)).toEqual(true);
  });

  it("rejects mismatched files", function () {
    const source = path.join(pSourceDir, "different/file/path.js");
    const test = path.join(pTestDir, "some/long/file/path.js");
    expect(matcher(source, test)).toEqual(false);
  });

});