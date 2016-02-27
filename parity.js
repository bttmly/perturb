require("babel-register");

const rewrite = require("./_src");
const original = require("./lib");

// const time = fn => (..._args) => {
//   const start = Date.now();
//   const [...args, cb] = _args;
//   fn(...args, function (err, result) {
//     const duration = Date.now - start;
//     console.log(duration);
    
//   })
// }

const run = require("./_src/run");

run(rewrite, "dogfood")
  .then(function (results) {
    console.log("DONE!");
    run(original, "dogfood", function (err, results) {
      console.log("DONE", err, results);
    });
  });