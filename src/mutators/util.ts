import R = require("ramda");

// class Multiple<T> { constructor (public items: T[]) }
// export const multiple = arr => new Multiple(arr);

export const update = R.curry(function <T>(prop: string, updater: Function, obj: T): T {
  return R.assoc(prop, updater(R.prop(prop, obj)), obj);
});

// export const multiUpdate = R.curry(function <T>(prop: string, updater: Function, obj: T): T[] {
//   return updater(R.prop, obj).map(updated => R.assoc(prop, updated, obj));
// });

export const lengthAtPropGreaterThan = R.curry(function (prop: string, count: number, obj): boolean {
  return R.path([prop, "length"], obj) > count;
});

export const dropEachOfProp = R.curry(function <T>(prop: string, obj:T): T[] {
  return obj[prop].map(function (_, i) {
    return R.assoc(prop, R.remove(i, 1, obj[prop]), obj);
  });
});