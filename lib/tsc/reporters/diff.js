"use strict";
const chalk = require("chalk");
const { diffLines } = require("diff");
const changeCase = require("change-case");
const R = require("ramda");
module.exports = {
    name: "diff",
    onResult: function (r) {
        console.log(generateReport(r));
    },
    onFinish: function (rs) {
        const [killed, alive] = R.partition(r => r.error, rs);
        const total = rs.length;
        const killCount = killed.length;
        const killRate = Number((total / killCount).toFixed(4)) * 100;
        console.log(`Total: ${total}. Killed: ${killCount}. Rate: ${killRate}%`);
    },
};
function generateReport(r) {
    const plus = "+    ";
    const minus = "-    ";
    const alive = "#ALIVE: ";
    const dead = "#DEAD: ";
    const id = identifier(r);
    if (r.error) {
        return chalk.gray(id);
    }
    const title = chalk.red.underline(alive + id);
    const diff = generateDiff(r);
    return [
        title,
        report.diff.map(function (entry) {
            const color = entry.added ? "green" : "red";
            const sign = entry.added ? plus : minus;
            return chalk[color](sign + entry.value.trim());
        }).join("\n"),
    ].join("\n");
}
function generateDiff(r) {
    return diffLines(r.sourceCode, r.mutatedSourceCode)
        .filter(node => node.added || node.removed);
}
function identifier(r) {
    const loc = r.loc.start.line + "," + r.loc.start.column;
    return changeCase.sentence(r.mutatorName) + " @" + r.loc;
}
