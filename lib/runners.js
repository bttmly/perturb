"use strict";

// executing runners in-process seems sketchy -- ideally we would shell out for it
// and use the exit code, but can we still gather enough data about the process if
// we aren't able to access it interactively/programmatically?

// making runners work in-process also makes authoring them **much** harder. should be as
// easy as "mocha test-file.js" or "tape test-file.js" or "jasmine test-file.js", right?

// can't recover from certain kinds of errors running tests in-process either.
// (unbounded tight loops caused by mutations, for example).

// ... however, running them in-process is EXTREMELY FAST relative to using a child
// process. Anecdotal dogfooding on mutators.js (before breaking it into separate
// modules) ran 25-35x faster in-process (observed times between 97-135s for child vs.
// consistent 3.5-4s in-process)

// child processes have better guarantees around some conditions, but a speed difference
// of that degree means it is essential to at least explore running mutations in-process
// (perhaps with reduced accuracy/environmental purity guarantees)

// TODO explore how to parallelize this. It's unclear how much of the child process
// start up time is just wasted. If we have a simple way to dictate parallelism we
// can see experimentally how close we can get child process running to in-process.
// (... with the obvious caveat that we **could** parallelize in-process execution)

// should provide APIs for plugging in both in-process and child process test runners
// ^^ since the API is just "call the callback when done", it's basically transparent
// ... aside from the major differences between in- and out-of-process runners, but
// we're all consenting adults, so if a user wants to risk shooting off a foot
// with an in-process runner, let them

module.exports = {
  mocha: require("./runners/mocha"),
  mochaChild: require("./runners/mocha-child"),
};
