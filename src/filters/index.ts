import * as R from "ramda";
import { MutantLocation } from "../types";

type LocationFilter = (m: MutantLocation) => boolean;

import { isUseStrict, isStringRequire, isESModuleInterop } from "./filter";

const filters: LocationFilter[] = [
  (m: MutantLocation) => !isUseStrict(m.node),
  (m: MutantLocation) => !isStringRequire(m.node),
  (m: MutantLocation) => !isESModuleInterop(m.node),
];

export default R.allPass(filters);

// TODO -- how to expose this?
export function inject(name: string) {
  let plugin: LocationFilter;
  try {
    plugin = require(`perturb-plugin-skipper-${name}`);
    filters.push(plugin);
  } catch (err) {
    // any way to recover? other locate strategy?
    console.log(
      `unable to locate -FILTER- plugin "${name}" -- fatal error, exiting`,
    );
    throw err;
  }
}
