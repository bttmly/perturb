const list = <T>(xs: T | T[]): T[] => Array.isArray(xs) ? xs : [xs];

export default function flatMap<T, U>(arr: T[], f: (t: T) => U | U[]): U[] {
  return arr.reduce(
    (acc: U[], item) =>
      acc.concat(list(f(item))),
    [])
}

