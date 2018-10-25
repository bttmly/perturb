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

export const lengthAtPropGreaterThan = (prop: string, count: number) => {
  return (obj: any) => (R.path([prop, "length"], obj) as number) > count;
};

// given an object with an array property, return an array of
// copies of that object, each copy having one of the array's
// elements removed

// dropEachOfProp("key", {key: [1, 2, 3]})
// => [ {key: [2, 3]}, {key: [1, 3]}, {key: [1, 2]} ]

export const dropEachOfProp = R.curry((prop: string, obj: any): any[] => {
  const arr: any[] = R.prop(prop, obj);
  // TODO: runtime verify Array.isArray(arr)
  return arr.map((_: any, i: number) => {
    return R.assoc(prop, R.remove(i, 1, arr), obj);
  });
});

export const dropEachOfPropPred = (prop: string, pred: (x: any) => boolean) => {
  return (obj: any) => {
    const results: any[] = [];
    const arr: any[] = R.prop(prop, obj);
    // TODO: runtime verify Array.isArray(target)
    for (let i = 0; i < arr.length; i++) {
      const item = arr[i];
      if (pred(item)) {
        results.push(R.assoc(prop, R.remove(i, 1, arr), obj));
      }
    }
  };
};
