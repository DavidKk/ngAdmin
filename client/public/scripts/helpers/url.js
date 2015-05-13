!(function(angular, window) {'use strict';

/**
 * parseUrl 解析URL地址，模拟 PHP parseUrl 方法
 * @param  {String} url URL地址
 * @return {Object}
 */
angular.parseUrl = function(url) {
  var aoMatch = /^(?:([^:\/?#]+):)?(?:\/\/()(?:(?:()(?:([^:@]*):?([^:@]*))?@)?([^:\/?#]*)(?::(\d*))?))?()(?:(()(?:(?:[^?#\/]*\/)*)()(?:[^?#]*))(?:\?([^#]*))?(?:#(.*))?)/.exec(url),
  aoKeys = [
    'source', 'scheme', 'authority', 'userInfo',
    'user', 'pass', 'host', 'port', 'relative', 'path', 'directory',
    'file', 'query', 'fragment'
  ];

  for (var i = aoKeys.length, oURI = { url: url }; i > 0; i --) {
    if (aoMatch[i]) {
      oURI[aoKeys[i]] = aoMatch[i];
    }
  }

  var oDomain = url.match(/^https?\:\/\/([^\/?#]+)(?:[\/?#]|$)/i);
  if (oDomain) {
    var aoRootDomain = oDomain[1].split('.'),
    nLen = aoRootDomain.length;

    oURI.domain = oDomain[1];
    oURI.rootDomain = aoRootDomain.slice(nLen-2, nLen).join('.');
  }

  if (oURI.scheme) oURI.scheme = oURI.scheme.toLowerCase();
  if (oURI.host) oURI.host = oURI.host.toLowerCase();

  return oURI;
};

/**
 * parseObject 将 GET 字符串解析成对象
 * @param  {String} string 需要解析的字符串
 * @return {Object}        解析完成的对象
 *
 * 例子
 * a=1&b=2&c=3 -> parseObject(...) -> {a:1, b:2, c:3}
 */
angular.parseObject = function(str) {
  if (! ('string' === typeof str && str.length > 0)) return {};
  for (var i = 0, aoMatch = str.split('&'), oArgs = {}, n, key, value, num; i < aoMatch.length; i ++) {
    n = aoMatch[i].split('=');
    key = n[0];
    value = n[1].toString() || '';
    oArgs[key] = decodeURIComponent(value);
  }

  return oArgs;
};

/**
 * parseString 将对象解析成 GET 数据
 * @param  {Object} object 需要解析的对象
 * @return {String}        完成解析的字符串
 *
 * 例子
 * {a:1,b:2,c:3} -> parseString(...) -> a=1&b=2&c=3
 */
angular.parseString = function(params) {
  var paramsToString = function(params, pre){
    var arr = [], param, i;
    if (!angular.isObject(params)) return;

    for (i in params) {
      param = params[i];
      if(angular.isObject(param)) {
        pre != ''
        ? arr = arr.concat(paramsToString(param, pre + '[' + i + ']'))
        : arr = arr.concat(paramsToString(param, i));
      }
      else if (param !== undefined) {
        pre != ''
        ? arr.push(pre, '[', i, ']', '=', param, '&')
        : arr.push(i, '=', param, '&');
      }
    }

    return arr;
  }

  return paramsToString(params, '').slice(0, -1).join('');
};

})(angular, window);