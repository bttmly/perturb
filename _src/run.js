const path = require("path");

const perturb = require("./index.js");

const src = path.join(__dirname, "../lib");
const test = path.join(__dirname, "../test");

perturb({
  rootDir: path.join(__dirname, ".."),
  runner: "mocha",
});