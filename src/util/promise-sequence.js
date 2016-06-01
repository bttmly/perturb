// thunk -> Promise

const Future = require("bluebird");

function promiseSequence (_thunks) {
  const thunks = _thunks.slice();

  return new Future(function (resolve) {
    const results = [];

    thunks.reduce(function (prev, next) {
      return prev.then(function (result) {
        results.push(result);
        return next();
      });
    }, Promise.resolve())
    .then(function () {
      console.log("done");
      resolve(results);
    })
    .catch(function (err) {
      console.log("error", err, err.stack);
      resolve(results);
    });
  });
}