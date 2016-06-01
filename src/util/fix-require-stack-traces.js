var Module = require("module");

function fixRequireStackTraces () {

  var originalRequire = Module.prototype.require;

  Module.prototype.require = function () {
    var originalTrace = Error.prepareStackTrace;

    Error.prepareStackTrace = function (error, stack) {
      return stack;
    };

    try {
      var out = originalRequire.apply(this, arguments);
    } catch (err) {
      var thisFile = new Error().stack[0].getFileName();
      var frameFile = err.stack.shift().getFileName();


      while (err.stack.length && frameFile === thisFile || frameFile === "module.js") {
        frameFile = err.stack.shift().getFileName();
        console.log(frameFile);
      }

      console.log("DONE");

      Error.prepareStackTrace = originalTrace;
      err.stack = Error.prepareStackTrace(err, err.stack);
      throw err;
    }


    Error.prepareStackTrace = originalTrace;
    return out;
  };


  return function restore () {
    Module.prototype.require = originalRequire;
  };
}

module.exports = fixRequireStackTraces;
