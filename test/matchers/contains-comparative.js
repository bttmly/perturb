const path = require("path");
const expect = require("expect");

const { makeConfig } = require("../helpers");

const containsComparative = require("../../built/matchers/contains-comparative");

let config, matcher, perturbDir;
describe("base-comparative matcher", function () {
  
  beforeEach(function () {
    config = makeConfig();
    matcher = containsComparative.makeMatcher(config);
    perturbDir = path.join(config.projectRoot, config.perturbDir);
    pTestDir = path.join(perturbDir, config.testDir);
    pSourceDir = path.join(perturbDir, config.sourceDir);
  });

  it("has type 'comparative'", function () {
    expect(containsComparative.type).toEqual("comparative");
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