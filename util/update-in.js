const R = require("ramda");

const assoc = R.curry(function assoc(prop, val, obj) {
  if (Array.isArray(obj)) {
    var result = obj.slice();
    result[prop] = val;
    return result;
  }

  var result = {};
  for (var p in obj) {
    result[p] = obj[p];
  }
  result[prop] = val;
  return result;
});

const assocPath = R.curry(function assocPath(path, val, obj) {
  switch (path.length) {
    case 0:
      return obj;
    case 1:
      return assoc(path[0], val, obj);
    default:
      console.log("path[0]", path[0], obj)
      return assoc(path[0], assocPath(path.slice(1), val, obj[path[0]] ), obj);
  }
});

const start = { a: [ "z", "y", { b: [ "x", { c: "w" } ] } ] };

const path = ["a", 2, "b", 1, "c" ];

// const updateIn = R.curry((path, val, obj) => R.compose(
//   R.set(R.__, val, obj),
//   R.apply(R.compose),
//   R.map(R.cond([[R.is(Number), R.lensIndex], [R.T, R.lensProp]]))
// )(path));

console.log(
  JSON.stringify(
    assocPath(path, "a", start), null, 2
  )
);


