"use strict";

module.exports = {

  runner: function () {
    return function runner (failures) {
      console.log(failures);
    };
  },

  reporter: function (counters) {
    counters = counters || {
      failed: [],
      passed: []
    };

    return function reporter (runner) {
      runner
        .on("pass", function (test) {
          counters.passed.push(test.fullTitle());
        })
        .on("fail", function (test) {
          counters.failed.push(test.fullTitle());
        });
    };
  }

};
