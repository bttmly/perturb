const path = require("path");

function run (perturb, which, runner) {
  let config;

  console.log("WHICH", which);

  switch (which.trim()) {
    case "dogfood":
      config = {
        projectRoot: path.join(__dirname, ".."),
        sourceDir: "built",
        runner: runner || "mocha",
        reporter: "name",
        testCmd: "make test-bail",
      };
      break;

    case "events":
      config = {
        testCmd: `node ${path.join(__dirname, "./examples/event-emitter/test.js")}`,
        matcher: {
          type: "comparative",
          makeMatcher: () => () => true,
        },
        projectRoot: path.join(__dirname, "./examples/event-emitter"),
        sourceDir: "lib",
        testDir: "test",
        runner: "node",
      }
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