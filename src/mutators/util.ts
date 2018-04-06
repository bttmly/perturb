import * as R from "ramda";

// class Multiple<T> { constructor (public items: T[]) }
// export const multiple = arr => new Multiple(arr);

export const update = R.curry(
  (prop: string, updater: (x: any) => any, obj: any): any => {
    return R.assoc(prop, updater(R.prop(prop, obj)), obj);
  },
);

// export const multiUpdate = R.curry(function <T>(prop: string, updater: Function, obj: T): T[] {
//   return updater(R.prop, obj).map(updated => R.assoc(prop, updated, obj));
// });

export const lengthAtPropGreaterThan = R.curry(
  (prop: string, count: number, obj: object): boolean => {
    return (R.path([prop, "length"], obj) as number) > count;
  },
);

export const dropEachOfProp = R.curry((prop: string, obj: any): any[] => {
  const target: any[] = R.prop(prop, obj);
  return target.map((_: any, i: number) => {
    return R.assoc(prop, R.remove(i, 1, target), obj);
  });
});
