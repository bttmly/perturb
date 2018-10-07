const path = require("path");

function run(perturb, which, runner) {
  let config;

  switch (which.trim()) {
    case "dogfood":
      config = {
        projectRoot: path.join(__dirname, "../"),
        sourceDir: "lib",
        runner: runner || "mocha",
        reporter: "diff",
        testCmd: "make test",
      };
      break;

    case "events":
      config = {
        testCmd: `node ${path.join(__dirname, "../examples/node-events/test.js")}`,
        matcher: {
          type: "comparative",
          makeMatcher: () => () => true,
        },
        projectRoot: path.join(__dirname, "../examples/node-events"),
        sourceDir: "lib",
        testDir: "test",
        runner: "fork",
      }
      break;

    case "toy":
      config = {
        projectRoot: path.join(__dirname, "../examples/toy-lib"),
        sourceDir: "lib",
        testDir: "test",
        runner: "mocha",
        testCmd: "npm t",
        matcher: "contains-comparative",
      }
      break;

    default:
      throw new Error("Unknown config " + which);
  }

  return perturb(config)
    .then(function ({ results }) {
      console.log("DONE!");
      console.log("kill count", results.filter(r => r.error).length, "/", results.length)
      return results;
    });
}

if (!module.parent) {
  run(require("../lib").default, process.argv[2], process.argv[3]);
}

// rethrowing it or exiting immediately seems to close the process before
// the entire error stack gets printed. So let's ease it up a bit.
process.on("unhandledRejection", err => {
  console.log(err);
  setTimeout(() => process.exit(1), 100);
});

module.exports = run;
