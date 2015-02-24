"use strict";

function isPrimitiveValue (value) {
  var t = typeof value;
  return (
    value !== null && (
      t === "symbol" ||
      t === "string" ||
      t === "number" ||
      t === "boolean"
    )
  );
}

function objIsShallow (obj) {
  if (isPrimitiveValue(obj)) return false;
  return Object.keys(obj).every(function (key) {
    return isPrimitiveValue(obj[key]);
  });
}

module.exports = {
  objIsShallow: objIsShallow
};
