// copied and (slightly) moddified from Ramda source code

import R = require("ramda");

type Prop = string | number;
type Target = any[] | Object

function assoc(prop: Prop, val: any, target: Target): Target {
  if (Array.isArray(target)) {
    const arr = target.slice();
    arr[prop] = val;
    return arr;
  }

  const obj = {};
  for (let p in target) {
    obj[p] = target[p];
  }
  obj[prop] = val;
  return obj;
}

function assocPath(path: Prop[], val: any, target: Target): Target {
  switch (path.length) {
    case 0:
      return target;
    case 1:
      return assoc(path[0], val, target);
    default:
      return assoc(
        path[0],
        assocPath(path.slice(1), val, target[path[0]]),
        target
      );
  }
}

module.exports = R.curry(assocPath);


