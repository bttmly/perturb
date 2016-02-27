const matchers = {
  "base-generative": require("./generative-matcher"),
  "base-comparative": require("./comparative-matcher"),
  "contains-comparative": require("./contains-comparative-matcher"),  
}

module.exports = function getMatcher (name) {
  if (matchers[name]) return matchers[name];
  throw new Error("matching plugins not implemented");
  return require("perturb-matcher-" + name);
}