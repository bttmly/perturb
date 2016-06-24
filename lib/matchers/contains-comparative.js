import * as path from "path";
// matches: 
//   source: project/lib/dir/car.js
//   test: project/test/dir/car-constructor.js
//   test: project/test/dir/car-start.js
//   test: project/test/dir/car-drive.js
function withoutExt(file) {
    return file.slice(0, -1 * path.extname(file).length);
}
export default {
    type: "comparative",
    makeMatcher: function (c) {
        return function (sourceFile, testFile) {
            var sourceName = withoutExt(sourceFile.split(c.perturbSourceDir).pop());
            var testName = withoutExt(testFile.split(c.perturbTestDir).pop());
            return testName.slice(0, sourceName.length) === sourceName;
        };
    }
};
