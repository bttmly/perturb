var path = require("path");

var main = require("./");

main({
  sharedParent: path.join(__dirname, "../example")
});