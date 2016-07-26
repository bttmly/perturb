const path = require("path");

function run (perturb, which, runner) {
  let config;

  switch (which) {
    case "dogfood":
      config = {
        rootDir: path.join(__dirname, ".."),
        sourceDir: "built",
        runner: runner || "mocha",
        reporter: "name",
        testCmd: "make test-bail",
      };
      break;

    case "example":
      config = {
        rootDir: path.join(__dirname, "../examples/toy-lib"),
        runner: "mocha",
      };
      break;

    default:
      throw new Error("Unknown config " + which);
  }

  return perturb(config)
    .then(function (results) {
      console.log("DONE!");
      console.log("kill count", results.filter(r => r.error).length, "/", results.length)
      return results;
    }).catch(function (err) {
      console.log("fatal error in perturb");
      process.exit(1);
    });
}

if (!module.parent) {
  run(require("./built"), process.argv[2], process.argv[3]);
}

module.exports = run;