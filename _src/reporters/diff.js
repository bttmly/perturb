var diffLines = require("diff").diffLines;
var assign = require("object-assign");
var chalk = require("chalk");
var changeCase = require("change-case");

function diffReporter (result) {
  var report = {
    loc: result.loc.start.line + "," + result.loc.start.column,
    name: result.name,
    error: result.error,
    diff: generateDiff(result),
    print: () => printDiffReport(report),
  }

  return report;
}

function identifier (report) {
  return changeCase.sentence(report.name) + " @" + report.loc;
}

function printDiffReport (report) {

  var alive = "#ALIVE: ";
  var dead = "#DEAD: ";
  var id = identifier(report);

  if (report.error) {
    console.log(chalk.gray(id));
    return;
  }

  var title = chalk.red.underline(alive + identifier(report));
  var plus = "+    ";
  var minus = "-    ";

  if (report.error) return;

  var output = [
    title,
    report.diff.map(function (entry) {
      var color = entry.added ? "green" : "red";
      var sign = entry.added ? plus : minus;
      return chalk[color](sign + entry.value.trim());
    }).join("\n"),
  ].join("\n");

  console.log(output);
}

function generateDiff (mutation) {
  return diffLines(mutation.sourceCode, mutation.mutatedSourceCode)
    .filter(node => node.added || node.removed);
}

module.exports = diffReporter;