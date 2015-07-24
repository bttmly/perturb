// this is only expected to run on my systems...

"use strict";

var exec = require("child_process").exec;

exec("nvm use system; node --v8-options | grep '\-\-'", function (err1, nodeFlags) {
  if (err1) throw err1;
  exec("nvm use iojs; node --v8-options | grep '\-\-'", function (err2, iojsFlags) {
    if (err2) throw err2;

    var flags = nodeFlags.split("\n").concat(iojsFlags.split("\n")).reduce(function (map, flag) {
      map[flag] = flag;
      return map;
    }, {});

    console.log(flags);
  });
});

