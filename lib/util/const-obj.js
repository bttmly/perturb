var assign = require("object-assign");

function constObj (obj) {
   return Object.freeze(assign(Object.create(null), obj));
}

module.exports = constObj;
