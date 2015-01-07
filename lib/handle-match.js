var intercept = require("intercept-require");

function handleMatch (match) {
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