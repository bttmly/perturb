# Code Structure

This project is structured as a series of independent steps which are orchestrated by the main function `perturb()` in `src/index.ts`. Each step's behavior can be customized through the use of plugins.

1. Run the project's test suite to ensure it passes -- if it doesn't, mutation testing is pointless.

2. Copy the source and test files into a new directory so we can safely work on those files without damaging the originals.

3. Run the `makeMatches` function, using the active [matcher plugin](https://github.com/nickb1080/perturb/blob/master/doc/plugins.md#matchers) on the source and test lists to get a list of of Match objects.

4. [`chain`](http://ramdajs.com/0.21.0/docs/#chain) the matches through the `makeMutants` function, using the active [mutator plugins](https://github.com/nickb1080/perturb/blob/master/doc/plugins.md#mutators), to generate a list of Mutant objects. (`chain` is also known as [`flatMap`](http://martinfowler.com/articles/collection-pipeline/flat-map.html) or [`mapcat`](https://clojuredocs.org/clojure.core/mapcat).)

5. Map the mutant objects through a composition of the `runMutant` function (which delegates to the active [runner plugin](https://github.com/nickb1080/perturb/blob/master/doc/plugins.md#runners)) and the active [reporter plugin](https://github.com/nickb1080/perturb/blob/master/doc/plugins.md#reporters)'s `onResult` method.

6. Pass the list of run results to the active [reporter plugin]()'s `onFinish()` method.