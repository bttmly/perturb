type AnyFunction = (...args: any[]) => any;

export default class Timer {
  mapping: { [name: string]: number }

  constructor() {
    this.mapping = {}
  }

  wrap<F extends AnyFunction>(name: string, f: F) {
    if (this.mapping[name] != null) {
      throw new Error(`already registered timing wrapper with name ${name}`)
    }
    this.mapping[name] = 0;
    return (...args: Parameters<F>): ReturnType<F> => {
      const start = Date.now();
      const result = f(...args);
      const diff = Date.now() - start;
      this.mapping[name] += diff;
      return result;
    }
  }

  dump() {
    return { ...this.mapping }
  }
}