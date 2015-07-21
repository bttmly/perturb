"use strict";

function setNodeValue (node, value) {
  return node.merge({
    value: value,
    raw: JSON.stringify(value)
  });
}

module.exports = setNodeValue;
