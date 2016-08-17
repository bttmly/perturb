import R = require("ramda");

// given an object with an array property, return an array of 
// copies of that object, each copy having one of the array's
// elements removed

// dropEachOfProp("key", {key: [1, 2, 3]})
// => [ {key: [2, 3]}, {key: [1, 3]}, {key: [1, 2]} ]

// will be helpful in testing removing each item from an object's property

export = function dropEachOfProp (key, obj) {
  return obj[key].map(function (_, i) {
    return R.assoc(key, R.remove(i, 1, obj[key]), obj);
  });
}
