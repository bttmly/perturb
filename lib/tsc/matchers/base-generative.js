"use strict";
const path = require("path");
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    type: "generative",
    makeMatcher: function (c) {
        return function (sourceFile) {
            var sourceRelPath = path.join(c.perturbRoot, c.perturbSourceDir);
            var testRelPath = path.join(c.perturbRoot, c.perturbTestDir);
            return sourceFile.replace(sourceRelPath, testRelPath);
        };
    },
};
