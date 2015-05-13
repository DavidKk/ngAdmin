!(function(angular, window) {'use strict';

/**
 * isEmptyObject 判断对象是否为空对象
 * @param  {Ojbect}  o 需要判断的对象
 * @return {Boolean}   True|False
 */ 
angular.isEmptyObject = function(o) {
  var i;
  for (i in o) return !1;
  return !0;
};

/**
 * clone 可能对象(只是对象数据，并不能复制实例化类的对象)
 * @param  {Object} a 需要可能的对象
 * @return {Object}   返回克隆的对象
 */
angular.clone = function(a) {
  if (angular.isObject(a)) {
    return angular.fromJson(angular.toJson(a));
  }

  return a;
};

angular.keys = function(object) {
  if (Object.keys) {
    return Object.keys(object);
  }

  var keys = [],
      i = '';

  for (i in object) {
    return keys.push(keys);
  }
};

/**
 * namespace 查找对象中的属性
 * @param  {String}   query
 * @param  {Object}   space 获取的对象
 * @param  {String}   token 分割 token
 * @return {Anything} 若不存在返回 undefined，若存在则返回该指向的值
 * 
 * Example:
 *   {a:{a:{a:{a:1}}}}  -> $.namespace('a.a.a.a') -> 1
 *   {a:1}              -> $.namespace('a.a.a.a') -> undefined
 */
angular.namespace = function(query, space, token) {
  if ('string' !== typeof query) {
    return undefined;
  }

  var i = 0,
      re = space,
      ns = query.split(token || '.'),
      len = ns.length;

  for (; i < len; i ++) {
    if ('undefined' === typeof re[ns[i]]) {
      return undefined;
    }

    re = re[ns[i]];
  }

  return 'undefined' === typeof re ? undefined : re;
};


/**
 * make 制作对象
 * @param  {String}   query
 * @param  {Object}   space 需要制作的对象
 * @param  {Anything} value 需要赋的值
 * @param  {String}   token 分割 token
 * @return {Anything}
 * 
 * Example:
 *   {a:{}}     -> $.make('a.a.a.a', 1) -> {a:{a:{a:{a:1}}}}
 *   {a:{a:1}}  -> $.make('a.a', 2)     -> {a:{a:2}}
 */
angular.make = function(query, space, value, token) {
  var i = 0,
  ori = space || {},
  re = ori,
  ns = query.split(token || '.');

  for (; i < ns.length; i ++) {
    if (i == ns.length -1) re[ns[i]] = value;
    else {
      if (! (re.hasOwnProperty(ns[i]) && angular.isObject(re[ns[i]]))) re[ns[i]] = {};
      re = re[ns[i]];
    }
  }

  return ori;
};

})(angular, window);