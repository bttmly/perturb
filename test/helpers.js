// "use strict";

// var esprima = require("esprima");
// var _ = require("lodash");
// var assign = require("object-assign");
// var I = require("immutable");
// var NODE_TYPES = require("../src/constants/node-types");
// var mutators = require("../src/mutators").mutators;

// function isPrimitiveValue (value) {
//   var t = typeof value;
//   return (
//     value !== null && (
//       t === "symbol" ||
//       t === "string" ||
//       t === "number" ||
//       t === "boolean"
//     )
//   );
// }

// function objIsShallow (obj) {
//   if (isPrimitiveValue(obj)) return false;
//   return Object.keys(obj).every(function (key) {
//     return isPrimitiveValue(obj[key]);
//   });
// }

// function makeNodeOfType (type, props) {
//   if (!(type in NODE_TYPES)) throw new Error("Invalid node type " + type);
//   props = props || {};
//   return I.Map(assign({type: type}, props));
// }

// function nodeFromCode (code) {
//   var ast = esprima.parse(code);
//   if (ast.body.length !== 1) {
//     throw new Error("Rendered AST did not have exactly one node");
//   }
//   return I.fromJS(ast.body[0]);
// }

// var mutatorByName = (function () {
//   var m = _.indexBy(mutators, "name");
//   return function mutatorByName (n) {
//     var mutator = m[n];
//     if (mutator == null) throw new Error("No mutator found by name " + n);
//     return mutator;
//   };
// })();

// module.exports = {
//   objIsShallow: objIsShallow,
//   makeNodeOfType: makeNodeOfType,
//   nodeFromCode: nodeFromCode,
//   mutatorByName: mutatorByName,
// };
