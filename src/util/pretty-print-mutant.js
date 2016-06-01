var assign = require("object-assign");
var chalk = require("chalk");
var changeCase = require("change-case");

function mutantId (mutant) {
  return changeCase.sentence(mutant.name) + " @" + mutant.loc;
}

function prettyPrintMutant (mutant) {

  // var alive = "\u2714  ";
  // var zombie = "\u26A0  ";
  // var killed = "\u2718  ";

  var alive = "#ALIVE: ";
  var dead = "#DEAD: ";

  var id = mutantId(mutant);

  var title = mutant.failed ?
    chalk.green(dead + id) :
    chalk.gray.underline(alive + id);

  // if (mutant.failed) {
  //   return chalk.green(dead + id);
  // }

  var plus = "+    ";
  var minus = "-    ";

  return [
    title,
    mutant.diff.map(function (entry) {
      var color = entry.added ? "green" : "red";
      var sign = entry.added ? plus : minus;
      return chalk[color](sign + entry.value.trim());
    }).join("\n"),
  ].join("\n");
}

module.exports = prettyPrintMutant;
