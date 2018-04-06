export function hasProp(prop: string) {
  return (node: any) => node.hasOwnProperty(prop) && node[prop] !== null;
}
