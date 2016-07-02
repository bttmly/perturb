require("babel-register");

const rewrite = require("./built");
const original = require("./src");

const run = require("./src/run");

run(rewrite, "dogfood")
  .then(function (results) {
    console.log("DONE!");
    run(original, "dogfood", function (err, results) {
      console.log("DONE", err, results);
    });
  });