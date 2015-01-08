
var fs = require("fs-extra");
var async = require("async");
var esprima = require("esprima");
var intercept = require("intercept-require");

function handleMatch (match, done) {

  async.parallel({
    sourceCode: fs.readFile.bind(null, match.sourceFile, {encoding: "utf8"}),
    testCode: fs.readFile.bind(null, match.testFile, {encoding: "utf8"})
  }, function (err, r) {
    if (err) return done(err);

    var ast = esprima.parse(r.testCode, ESPRIMA_OPTIONS);

    done();
  });

  // start require() interception
  // looking for original relative path

  // find and parse source code
  // generate a list of mutations
  
  // for each mutation
    // write it to the source file
    // run the test file
      // if require() interceptor is hit, provide the mutated file
    // collect errors

  // write original source back to file
  // pass errors out
}

module.exports = handleMatch;