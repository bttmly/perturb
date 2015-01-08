"use strict";

module.exports = {

  runner: function () {
    return function runner (failures) {
      // console.log(failures);
    };
  },

  reporter: function (counters) {
    counters = counters || {
      failed: [],
      passed: []
    };

    return function reporter (runner) {
      runner.on("pass", function (test) {
        console.log("pass")
        counters.passed.push(test.fullTitle());
      });
      
      runner.on("fail", function (test, err) {
        console.log("fail")
        counters.failed.push(test.fullTitle());
      });

      runner.on("end", function () {
        console.log("end");
      });
    };
  }

};