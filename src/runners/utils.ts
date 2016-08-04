import fs = require("fs");

export = {
  writeMutatedCode (m: Mutant) {
    fs.writeFileSync(m.sourceFile, m.mutatedSourceCode);
  },

  restoreOriginalCode (m: Mutant) {
    fs.writeFileSync(m.sourceFile, m.originalSourceCode);
  },

  // TODO: we can optimize this in various ways, if it seems to be a bottleneck.
  // Obviously it only really matters for in-process runners, but anecdotally a
  // full cache flush seems to slow down those runners by 20-30%
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