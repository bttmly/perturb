///<reference path="../typings/globals/node/index.d.ts"/>
///<reference path="../typings/globals/bluebird/index.d.ts"/>
///<reference path="../typings/modules/ramda/index.d.ts"/>
const Bluebird = require("bluebird");
const R = require("ramda");
const getRunner = require("./runners/index");
const getReporter = require("./reporters/index");
const getMatcher = require("./matchers/index");
const makeMutants = require("./make-mutants");
const fileSystem = require("./file-system");
function hasTests(m) {
    return Boolean(R.path(["tests", "length"], m));
}
module.exports = function perturb(cfg) {
    const { setup, teardown, paths } = fileSystem(cfg);
    const matcher = getMatcher(cfg);
    const runner = getRunner(cfg.runner);
    const reporter = getReporter(cfg.reporter);
    // this handler does all the interesting work on a single Mutant
    const handler = makeMutantHandler(runner, reporter);
    // first, set up the "shadow" file system that we'll work against
    return Promise.resolve(setup())
        .then(() => paths())
        .then(function ({ sources, tests }) {
        const matches = matcher(sources, tests);
        const [tested, untested] = R.partition(hasTests, matches);
        // TODO -- surface untested file names somehow
        return tested;
    })
        .then(makeMutants)
        .then(function (ms) {
        // TODO -- right here we can serialize all the mutants before running them
        // any reason we might want to do this?
        // 
        // this is the separation point between pure data and actually executing
        // the tests against mutated source code
        return ms;
    })
        .then(function (ms) {
        return Bluebird.mapSeries(ms, handler);
    })
        .then(function (rs) {
        if (reporter.onFinish) {
            reporter.onFinish(rs);
        }
        return rs;
    });
};
function makeMutantHandler(runner, reporter) {
    return function handler(m) {
        let _before, _result;
        return runner.prepare(m)
            .then(before => {
            _before = before;
            return runner.run(m);
        })
            .then(result => {
            _result = result;
            return runner.cleanup(result, _before);
        })
            .then(() => {
            if (reporter.onResult) {
                reporter.onResult(_result);
            }
            return _result;
        });
    };
}
