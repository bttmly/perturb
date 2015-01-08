var path = require("path");

var fs = require("fs-extra");

var main = require("./");

var exampleDir = path.join(__dirname, "../example");

main({
  sharedParent: exampleDir
});

fs.remove(path.join(exampleDir, ".perturb-source"));
fs.remove(path.join(exampleDir, ".perturb-test"));