module.exports {
  string: function isString (s) {
    return typeof s === "string";
  },
  number: function isNumber (n) {
    return typeof n === "number"
  },
  boolean: function isBoolean (b) {
    return typeof b === "boolean"
  },
  func: function isFunction (f) {
    return typeof f === "function"
  },
}
