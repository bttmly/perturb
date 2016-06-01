const reporters = {
  diff: require("./diff"),
}

module.exports = function getReporter (name) {
  if (reporters[name]) return reporters[name];
  throw new Error("reporter plugins not implemented");
  return require("perturb-reporter-" + name);
}