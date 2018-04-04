import * as R from "ramda"

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
  const target: any[] = R.prop(prop, obj)
  return target.map(function (_: any, i: number) {
    return R.assoc(prop, R.remove(i, 1, target), obj);
  });
});