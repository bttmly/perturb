import * as path from "path";
export default {
    type: "comparative",
    makeMatcher: function (c) {
        return function (sourceFile, testFile) {
            var sourceName = sourceFile.split(path.join(c.perturbRoot, c.perturbSourceDir)).pop();
            var testName = testFile.split(path.join(c.perturbRoot, c.perturbTestDir)).pop();
            return sourceName === testName;
        };
    }
};
