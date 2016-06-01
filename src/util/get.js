function get (prop) {
  return function _get (obj) {
    if (obj[prop] == null) throw new Error("No value");
    return obj[prop];
  }
}

module.exports = get;
