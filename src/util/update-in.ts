// copied and (slightly) modified from Ramda source code

// R.assoc/R.assocPath turn arrays into number-indexed objects
// while this modified version leaves arrays intact.

import R = require("ramda");

type Prop = string | number;

function assoc(prop: Prop, val: any, target: any): any {
  if (Array.isArray(target)) {
    const arr = target.slice();
    arr[Number(prop)] = val;
    return arr;
  }

  const obj = { ...target };
  obj[prop] = val;
  return obj;
}

function assocPath(path: Prop[], val: any, target: any): any {
  switch (path.length) {
    case 0:
      return target;
    case 1:
      return assoc(path[0], val, target);
    default:
      const [first, ...rest] = path;
      return assoc(first, assocPath(rest, val, target[first]), target);
  }
}

export = R.curry(assocPath);
