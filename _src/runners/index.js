const runners = {
  mocha: require("./mocha"),
};

module.exports = {

  get (name) {
    return runners[name];
  },

  register (name, runner) {
    // validate(runner)
    // if (runners.get(name)) throw new Error()
    runners[name] = runner;
  },

}