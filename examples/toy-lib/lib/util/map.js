function likeEs5Map(arr, cb) {
  var len = arr.length;
  var result = Array();
  for (var i = 0; i < len; i++) {
    if (i in arr) {
      result[i] = cb(arr[i], i, arr);
    }
  }
  return result;
}

function likeLodashMap(arr, cb) {
  var len = arr.length;
  var result = Array();
  for (var i = 0; i < len; i++) {
    result[i] = cb(arr[i], i, arr);
  }
  return result;
}

module.exports = {
  likeEs5Map: likeEs5Map,
  likeLodashMap: likeLodashMap,
};