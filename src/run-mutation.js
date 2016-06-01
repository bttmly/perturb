"use strict";

function runMutation (mutation) {
  const {runner} = mutation;
  let before, result;
  return Promise.resolve(runner.before(mutation))
    .then(_before => before = _before)
    .then(() => runner.run(mutation))
    .then(_result => result = _result)
    .then(result => runner.after(mutation, before))
    .then(() => result);
}

module.exports = runMutation;