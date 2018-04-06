import { RunnerPlugin, Mutant } from "../types";

export default async function runMutant(runner: RunnerPlugin, mutant: Mutant) {
  let before;
  try {
    before = await runner.setup(mutant);
    return await runner.run(mutant, before);
  } finally {
    await runner.cleanup(mutant, before);
  }
}
