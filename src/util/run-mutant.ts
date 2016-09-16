export = function runMutant (runner: RunnerPlugin, mutant: Mutant) {
  return runner.setup(mutant)
    .then(function (before) {
      return runner.run(mutant)
        .finally(() => runner.cleanup(mutant, before))
    });
}

// async function runMutant (runner: RunnerPlugin, mutant: Mutant) {
//   const before = await runner.setup(mutant);
//   try {
//     await runner.run(mutant);
//   } finally {
//     await runner.cleanup(mutant, before);
//   }
// }