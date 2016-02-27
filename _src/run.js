const path = require("path");

function run (perturb, which, cb) {
  let config;

  switch (which) {
    case "dogfood":
      config = {
        rootDir: path.join(__dirname, ".."),
        runner: "mocha",
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

  if (cb) {
    return perturb(config, function (err, results) {
      if (err) {
        console.log("fatal error in perturb");
        console.log(err);
        console.log(err.stack);
        cb(err);
        process.exit(1);
      }

      console.log(results)
      try {
        console.log("kill count", results.filter(r => r.error).length, "/", results.length)
      } catch (e) {}
      cb(null, results);
    });
  }

  return perturb(config)
    .then(function (results) {
      console.log("kill count", results.filter(r => r.error).length, "/", results.length)
      return results;
    }).catch(function (err) {
      console.log("fatal error in perturb");
      console.log(err);
      console.log(err.stack);
      process.exit(1);
    });
}

if (!module.parent) {
  run(proess.argv[2], require("./"))
}

module.exports = run;