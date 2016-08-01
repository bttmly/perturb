async function runMutant (runner: RunnerPlugin, mutant: Mutant) {
  const before = await runner.setup(mutant);
  const result: RunnerResult = await runner.run(mutant);
  await runner.cleanup(mutant, before);
  return result;
}