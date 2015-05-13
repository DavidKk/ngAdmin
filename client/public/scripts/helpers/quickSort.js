!(function(angular, window) {'use strict';

/**
 * quickSort 快排，当基数大的时候使用简单快捷，原理 Goggle
 * @param  {Array}    xs                 需要排序的数组
 * @param  {Bollean}  desc  (optional)   是否为倒序，默认为 false
 * @param  {String}   key   (optional)   若为对象，则以某个index 来进行比对值
 * @param  {String}   begin (optional)   只排部分，开始index
 * @param  {String}   end   (optional)   只排部分，结束index
 */
angular.quickSort = (function() {
  var INSERT_SORT_THRESHOLD = 10,
  compare = function(a, b, desc, key_or_func) {
    if (angular.isFunction(key_or_func)) {
      return desc === true ? key_or_func(a) > key_or_func(b) : key_or_func(a) < key_or_func(b);
    }

    if (angular.isString(key_or_func) && a.hasOwnProperty(key_or_func) && b.hasOwnProperty(key_or_func)) {
      return desc === true ? a[key_or_func] > b[key_or_func] : a[key_or_func] < b[key_or_func];
    }

    return desc === true ? a > b : a < b;
  },
  isort = function(xs, begin, end, desc, key) {
    var a, b, t;
    for (a = begin; a < end; a += 1) {
      t = xs[a];
      for (b = a; b > begin && compare(t, xs[b-1], desc, key); b -= 1) {
        xs[b] = xs[b-1];
      }

      xs[b] = t;
    }

    return xs;
  },
  medianOfThree = function(a, b, c, desc, key) {
    if (compare(a, b, desc, key)) {
      if (compare(b, c, desc, key)) return b;
      else if (compare(a, c, desc, key)) return c;
      else return a;
    }
    else {
      if (compare(a, c, desc, key)) return a;
      else if (compare(b, c, desc, key)) return c;
      else return b;
    }
  },
  vecswap = function(xs, a, b, c) {
    var n = Math.min(b - a, c - b),
    i = a,
    t, j;

    for (j = c - n, i = a; j < c; j += 1, i += 1) {
      t = xs[i];
      xs[i] = xs[j];
      xs[j] = t;
    }

    return a + (c - b);
  },
  sort = function(xs, begin, end, desc, key) {
    if (end < begin + INSERT_SORT_THRESHOLD) {
      isort(xs, begin, end, desc, key);
      return;
    }

    var i = begin - 1,
    j = end,
    u = i,
    v = j,
    pivot = medianOfThree(xs[begin], xs[Math.floor((begin + end) / 2)], xs[end -1], desc, key),
    t;

    while (i < j) {
      i += 1;
      while (i < j && compare(xs[i], pivot, desc, key)) i += 1;

      j -= 1;
      while (i < j && compare(pivot, xs[j], desc, key)) j -= 1;

      if (i < j) {
        t = xs[i];
        xs[i] = xs[j];
        xs[j] = t;

        if (!(compare(xs[i], pivot, desc, key))) {
          u += 1;
          t = xs[i];
          xs[i] = xs[u];
          xs[u] = t;
        }

        if (!compare(pivot, xs[j], desc, key)) {
          v -= 1;
          t = xs[j];
          xs[j] = xs[v];
          xs[v] = t;
        }
      }
    }

    j = vecswap(xs, i, v, end);
    i = vecswap(xs, begin, u + 1, i);

    sort(xs, begin, i, desc, key);
    sort(xs, j, end, desc, key);
  };

  return function(xs, desc, key, begin, end) {
    sort(xs, 'number' === typeof begin ? begin : 0, 'number' === typeof end ? end : xs.length, desc, key);
    return xs;
  };
})();

})(angular, window);