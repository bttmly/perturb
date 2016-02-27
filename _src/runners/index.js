const runners = {
  mocha: require("./mocha"),
};

module.exports = function getRunner (name) {
  if (runners[name]) return runners[name];
  throw new Error("runner plugins not implemented");
  return require("perturb-runner-" + name);
}