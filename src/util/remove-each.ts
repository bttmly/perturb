///<reference path="../../typings/modules/ramda/index.d.ts"/>

{

const R = require("ramda");

function mapRemoveKeyItem (key, obj) {
  return obj[key].map(function (_, i) {
    return R.assoc(key, R.remove(i, 1, obj[key]), obj);
  });
}

module.exports = R.curry(mapRemoveKeyItem);

}