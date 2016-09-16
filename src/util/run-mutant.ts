export = async function runMutant (runner: RunnerPlugin, mutant: Mutant) {
  let before, result;
  try {
    before = await runner.setup(mutant);
    return await runner.run(mutant);
  } finally {
    await runner.cleanup(mutant, before);
  }
}