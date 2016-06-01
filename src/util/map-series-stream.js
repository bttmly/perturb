var R = require("ramda");
var Readable = require("stream").Readable;

module.exports = R.curry(function mapSeriesStream (mapper, _items) {
  const items = _items.slice();
  const results = [];

  const rs = Readable({ objectMode: true, read () {} });

  next(items.shift());

  function next (item) {

    mapper(item).then(function (result) {
      rs.push(result);
      results.push(result);

      if (items.length === 0) {
        rs.push(null);
        rs.emit("complete", results);
        return;
      }

      next(items.shift());
    });
  }

  return rs;
});
