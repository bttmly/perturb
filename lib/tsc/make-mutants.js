"use strict";
const R = require("ramda");
const fs = require("fs-extra");
const exprima = require("esprima");
const escodegen = require("escodegen");
const estraverse = require("estraverse");
const shouldSkip = require("./skippers");
const { getMutatorsForNode, hasAvailableMutations } = require("./mutators");
const JS_TYPES = require("./constants/js-types");
const ESPRIMA_SETTINGS = {
    loc: true,
    comment: true,
};
const FS_SETTINGS = {
    encoding: "utf8",
};
module.exports = function makeMutants(match) {
    const { source, tests } = match;
    const { ast, code } = parse(source);
    const paths = getMutationPaths(ast).map(p => p.map(String));
    // we regenerate the source code here to make it easy for diffing
    const originalSourceCode = escodegen.generate(ast);
    return R.chain(mutationsFromPath, paths);
    function mutationsFromPath(path) {
        const node = R.path(path, ast);
        return getMutatorsForNode(node)
            .filter(mutatorFilterFromNode(node))
            .map(function (m) {
            // this can be done more elegantly with Ramda lenses, probably
            const newNode = m.mutator(node);
            const updatedAst = R.assocPath(path, newNode, ast);
            const mutatedSourceCode = escodegen.generate(updatedAst);
            // both the original source and the mutated source are present here
            // to avoid unnecessary extra code generation in mutator prep/teardown,
            // and also in reporters
            return {
                sourceFile: source,
                testFiles: tests,
                path: path,
                mutatorName: m.name,
                astAfter: updatedAst,
                astBefore: ast,
                loc: node.loc,
                originalSourceCode: originalSourceCode,
                mutatedSourceCode: mutatedSourceCode,
            };
        });
    }
};
function getMutationPaths(ast) {
    const mutationPaths = [];
    estraverse.traverse(ast, {
        enter: function (node) {
            const path = this.path();
            if (shouldSkip(node, path))
                return this.skip();
            if (hasAvailableMutations(node))
                mutationPaths.push(path);
        },
    });
    return mutationPaths;
}
function mutatorFilterFromNode(node) {
    return function (mutator) {
        if (mutator.filter == null)
            return true;
        if (mutator.filter(node))
            return true;
        return false;
    };
}
function parse(source) {
    const originalSource = fs.readFileSync(source).toString();
    let ast;
    try {
        ast = esprima.parse(originalSource, ESPRIMA_SETTINGS);
    }
    catch (err) {
        // TODO -- better error handling here
        console.log("ERROR PARSING SOURCE FILE", source);
        throw err;
    }
    const code = escodegen.generate(ast);
    return { ast: ast, code: code };
}
