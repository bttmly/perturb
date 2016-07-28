import fs = require("fs");

import { Mutant } from "../types";

export = {
  writeMutatedCode (m: Mutant) {
    fs.writeFileSync(m.sourceFile, m.mutatedSourceCode);
  },
  restoreOriginalCode (m: Mutant) {
    fs.writeFileSync(m.sourceFile, m.originalSourceCode);
  },
  clearRequireCache () {
    Object.keys(require.cache).forEach(k => delete require.cache[k]);
  },
  makeErrorSerializable (err?: Error) {
    if (err == null) {
      return undefined;
    }

    Object.defineProperties(err, {
      stack: {
        enumerable: true,
        configurable: true,
        writable: true,
        value: err.stack,
      },
      message: {
        enumerable: true,
        configurable: true,
        writable: true,
        value: err.message,
      }
    });
    
    return err;
  }
}