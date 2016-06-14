const Bluebird = require("bluebird");

module.exports = R.curry(function pMapSeries (fn, itr) {
  return Bluebird.mapSeries(itr, fn);
});