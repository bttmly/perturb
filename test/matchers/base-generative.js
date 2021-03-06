const path = require("path");
const expect = require("expect");

const { makeConfig } = require("../helpers");

const plugin = require("../../lib/matchers/base-generative").default;

describe("base-generative matcher", function() {
  let matcher, perturbDir, pTestDir, pSourceDir;

  const config = makeConfig();

  beforeEach(function() {
    matcher = plugin.makeMatcher(config);
    perturbDir = path.join(config.projectRoot, config.perturbDir);
    pTestDir = path.join(perturbDir, config.testDir);
    pSourceDir = path.join(perturbDir, config.sourceDir);
  });

  it("has matchType 'generative'", function() {
    expect(plugin.matchType).toBe("generative");
  });

  it("joins the configured test directory with the file path", function() {
    const filePath = "some/long/file/path.js";
    const source = path.join(pSourceDir, filePath);
    const result = matcher(source);
    const expected = path.join(pTestDir, filePath);
    expect(result).toBe(expected);
  });
});
