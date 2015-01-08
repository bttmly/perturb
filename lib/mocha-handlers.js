var handlers = module.exports = {
  runner: function () {
    return function runner (failures) {
      console.log(failures);
    };
  },
  reporter: function () {
    return function reporter (runner) {
      var failed = 0;
      var passed = 0;
      
      runner.on("pass", function () {
        passed += 1;
      });
      
      runner.on("fail", function () {
        failed += 1;
      });

      runner.on("end", function () {

      });
    };
  }
};