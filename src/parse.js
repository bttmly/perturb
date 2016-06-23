const esprima = require("esprima");
const escodegen = require("escodegen");

function parse (source, options) {
  const ast = esprima.parse(code, { comments: true, loc: true });
  const code = escodegen.generate(ast);
  return { code, ast };
}

module.exports = parse;
