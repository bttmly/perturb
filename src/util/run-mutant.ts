export = function runMutant (runner: RunnerPlugin, mutant: Mutant) {
  return runner.setup(mutant)
    .then(function (before) {
      return runner.run(mutant)
        .finally(() => runner.cleanup(mutant, before))
    });
}