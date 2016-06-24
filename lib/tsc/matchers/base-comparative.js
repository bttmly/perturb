"use strict";
const path = require("path");
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    type: "comparative",
    makeMatcher: function (c) {
        return function (sourceFile, testFile) {
            var sourceName = sourceFile.split(path.join(c.perturbRoot, c.perturbSourceDir)).pop();
            var testName = testFile.split(path.join(c.perturbRoot, c.perturbTestDir)).pop();
            return sourceName === testName;
        };
    }
};
