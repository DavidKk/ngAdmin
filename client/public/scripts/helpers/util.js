/**
 * Util
 * @author  <David Jones qowera@qq.com>
 */
angular.module('helpers.util', [])

.config([
  function() {
    'use strict'

    // Array
    // ================

    /**
     * inArray 获取元素在数组中所在位置的键值
     * @param  {Anything} value 要获取键值的元素
     * @param  {Array}    array 数组
     * @return {Integer}        键值
     */
    angular.inArray = (function() {
      if (Array.prototype.indexOf) {
        return function(value, array) {
          return array.indexOf(value)
        }
      }

      return function(value, array) {
        var i = 0
            , l = array.length

        for (; i < l; i ++) {
          if (value === array[i]) {
            return i
          }
        }

        return -1
      }
    })()

    /**
     * inArrayBy inArray 增强版，获取数组中元素拥有与要查询元素相同的属性值的键值
     * @param  {Object|Integer} var_index 对象或数字(数字用于数组下标)
     * @return {Integer}                  键值，不存在返回 -1;
     */
    angular.inArrayBy = function(var_index, array, keyName) {
      var i = 0
          , l = array.length
          , value

      value = angular.isObject(var_index)
        ? var_index[keyName]
        : value = var_index

      for (; i < l; i ++) {
        if (value === array[i][keyName]) {
          return i
        }
      }

      return -1
    }

    /**
     * filter 过滤数组中的元素
     * @param {Array}     array     要过滤元素的数组
     * @param {Function}  callback  回调函数，当返回 false 则过滤函数，否则不过滤
     */
    angular.filter = (function() {
      if (Array.prototype.filter) {
        return function(array, callback) {
          return Array.prototype.filter.call(array, callback)
        }
      }

      return function(array, callback) {
        var i = 0
            , l = array.length

        for (; i < l; i ++) {
          if (false == callback(array[i])) {
            array.splice(i --, 1)
          }
        }
      }
    })()

    /**
     * unique 去重
     * @param  {Array} array  数组
     * @return {Array}        去重后的数组
     */
    angular.unique = (function() {
      if (Array.prototype.filter) {
        return function(array) {
          return [].concat(array).filter(onlyUnique)
        }

        function onlyUnique(value, index, self) { 
          return index === self.indexOf(value)
        }
      }

      return function(array) {
        var n = {}
            , r = []
            , i = array.length

        for (;i --;) {
          if (!n.hasOwnProperty(array[i])) {
            r.push(array[i])
            n[array[i]] = 1 
          }
        }

        return r
      }
    })()


    // Object
    // =================

    /**
     * isBoolean 判断对象是否为 boolean 类型
     * @param  {Anything} a 需要判断的对象
     * @return {Boolean}    True|False
     */
    angular.isBoolean = function(a) {
      return a === true
        || a === false
        || '[object Boolean]' == Object.prototype.toString.call(a)
    }

    /**
     * isEmptyObject 判断对象是否为空对象
     * @param  {Ojbect}  object 需要判断的对象
     * @return {Boolean}
     */ 
    angular.isEmptyObject = function(object) {
      var i

      for (i in object) {
        return !1
      }

      return !0
    }

    /**
     * isWindow 判断对象是否为 window 对象
     * @param  {Object}  a 要检测的对象
     * @return {Boolean}
     */
    angular.isWindow = function(a) {
      return null != a && a === a.window
    }

    /**
     * clone 克隆对象(只是对象数据，并不能复制实例化类的对象)
     * @param  {Object} object  需要克隆对象
     * @return {Object}         返回克隆的对象
     */
    angular.clone = function(object) {
      if (angular.isObject(object)) {
        return angular.fromJson(angular.toJson(object))
      }

      return object
    }

    /**
     * keys 获取已对象 key 为 value 的数组
     * @param  {Object} object 目标对象
     * @return {Array}
     */
    angular.keys = (function() {
      if (Object.keys) {
        return function(object) {
          return Object.keys(object);
        }
      }

      return function(object) {
        var keys = []
            , i = ''

        for (i in object) {
          keys.push(i)
        }

        return keys;
      }
    })()

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
        return undefined
      }

      var re = space
          , ns = query.split(token || '.')
          , i = ns.length

      for (; i --;) {
        if ('undefined' === typeof re[ns[i]]) {
          return undefined
        }

        re = re[ns[i]]
      }

      return 'undefined' === typeof re ? undefined : re
    }

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
      var i = 0
          , l = ns.length
          , ori = space || {}
          , re = ori
          , ns = query.split(token || '.');

      for (; i < l; i ++) {
        if (i == l -1) {
          re[ns[i]] = value
        }
        else {
          if (! (re.hasOwnProperty(ns[i]) && angular.isObject(re[ns[i]]))) {
            re[ns[i]] = {}
          }

          re = re[ns[i]]
        }
      }

      return ori
    }


    // String
    // =================

    /**
     * isEn 判断字符串是否为英文
     * @param  {String}  str 字符串
     * @return {Boolean}
     */
    angular.isEn = function(str) {
      var reg = /^[a-zA-Z0-9]+$/ig
      return reg.test(str)
    }

    /**
     * isCh 判断字符串是否为中文
     * @param  {String}  str 字符串
     * @return {Boolean}
     */
    angular.isCh = function(str) {
      var reg = /^[\u4E00-\uFA29]+$/ig
      return reg.test(str)
    }

    /**
     * isNumeric 判断字符串是否为数字
     * @param  {String}  number 需要判断的字符串
     * @return {Boolean}        True|False
     */
    angular.isNumeric = function(number) {
      return !angular.isArray(number) && number - parseFloat(number) >= 0
    }

    /**
     * isIngeter 判断字符串或数字是否为整数
     * @param  {String}  number 需要判断的字符串或数字
     * @return {Boolean}        True|False
     */
    angular.isIngeter = function(number) {
      return angular.isNumeric(number) && parseInt(number) == parseFloat(number)
    }

    /**
     * isUrl 判断字符串是否为URL地址
     * @param  {String}  url 需要判断的URL
     * @return {Boolean}     True|False
     */
    angular.isUrl = function(url) {
      return /^(https?:\/\/)?((([a-z\d]([a-z\d-]*[a-z\d])*)\.)+[a-z]{2,}|((\d{1,3}\.){3}\d{1,3}))(\:\d+)?(\/[-a-z\d%_.~+]*)*(\?[;&a-z\d%_.~+=-]*)?(\#[-a-z\d_]*)?$/.test(url)
    }

    /**
     * getLen 获取字符串英文长度（只获取英文部分）
     * @param  {String}  str 字符串
     * @return {Integer}
     */
    angular.getEnLen = function(str) {
      var mh = str && str.match(/[^\u4E00-\uFA29]/ig)
      return mh ? mh.length : 0
    }

    /**
     * getChLen 获取字符串中文长度（只获取中文部分）
     * @param  {String}  str 字符串
     * @return {Integer}
     */
    angular.getChLen = function(str) {
      var mh = str && str.match(/[\u4E00-\uFA29]/ig)
      return mh ? mh.length * 2 : 0
    }

    /**
     * getNumLen 获取数字字符串长度
     * @param  {String} str 字符串
     * @return {Integer}
     */
    angular.getNumLen = function(str) {
      var mh = str && str.match(/[0-9]/ig)
      return mh ? mh.length : 0
    }

    /**
     * getLen 获取字符串长度（区分中英文）
     * @param  {String}  str 字符串
     * @return {Integer}
     */
    angular.getLen = function(str) {
      var ch = angular.getChLen(str)
      var en = angular.getEnLen(str)
      return ch + en
    };

    /**
     * getLenInCh 按中文占字节数获取字符串长度（多数用于多少个字）
     * @param  {String}  str 字符串
     * @return {Integer}
     */
    angular.getLenInCh = function(str) {
      var len = angular.getLen(str)
      return Math.ceil(len/2)
    }

    /**
     * toNumber 强制转换成数字 (当为 NaN时，自动转成 0)
     * @param  {String} str 字符串
     * @return {Number}
     */
    angular.toNumber = function(str) {
      var num = str*1
      return isNaN(num) ? 0 : num
    }

    // URL
    // ========================

    /**
     * parseUrl 解析URL地址，模拟 PHP parseUrl 方法
     * @param  {String} url URL地址
     * @return {Object}
     */
    angular.parseUrl = function(url) {
      var aoMatch = /^(?:([^:\/?#]+):)?(?:\/\/()(?:(?:()(?:([^:@]*):?([^:@]*))?@)?([^:\/?#]*)(?::(\d*))?))?()(?:(()(?:(?:[^?#\/]*\/)*)()(?:[^?#]*))(?:\?([^#]*))?(?:#(.*))?)/.exec(url)
          , aoKeys = [
            'source', 'scheme', 'authority', 'userInfo',
            'user', 'pass', 'host', 'port', 'relative', 'path', 'directory',
            'file', 'query', 'fragment'
          ]
          , i = aoKeys.length
          , oURI = { url: url }

      for (; i --;) {
        if (aoMatch[i]) {
          oURI[aoKeys[i]] = aoMatch[i]
        }
      }

      var oDomain = url.match(/^https?\:\/\/([^\/?#]+)(?:[\/?#]|$)/i)

      if (oDomain) {
        var aoRootDomain = oDomain[1].split('.')
        , nLen = aoRootDomain.length

        oURI.domain = oDomain[1]
        oURI.rootDomain = aoRootDomain.slice(nLen-2, nLen).join('.')
      }

      if (oURI.scheme) {
        oURI.scheme = oURI.scheme.toLowerCase()
      }

      if (oURI.host) {
        oURI.host = oURI.host.toLowerCase()
      }

      return oURI
    }

    /**
     * parseObject 将 GET 字符串解析成对象
     * @param  {String} string 需要解析的字符串
     * @return {Object}        解析完成的对象
     *
     * 例子
     * a=1&b=2&c=3 -> parseObject(...) -> {a:1, b:2, c:3}
     */
    angular.parseObject = function(str) {
      if (! ('string' === typeof str && str.length > 0)) {
        return {}
      }

      var i = 0
          , aoMatch = str.split('&')
          , l = aoMatch.length
          , oArgs = {}
          , n
          , key
          , value
          , num

      for (; i < l; i ++) {
        n = aoMatch[i].split('=')
        key = n[0]
        value = n[1].toString() || ''
        oArgs[key] = decodeURIComponent(value)
      }

      return oArgs
    }

    /**
     * parseString 将对象解析成 GET 数据
     * @param  {Object} object 需要解析的对象
     * @return {String}        完成解析的字符串
     *
     * 例子
     * {a:1,b:2,c:3} -> parseString(...) -> a=1&b=2&c=3
     */
    angular.parseString = function(params) {
      var paramsToString = function(params, pre) {
        var arr = []
            , param
            , i

        if (!angular.isObject(params)) {
          return
        }

        for (i in params) {
          param = params[i]

          if (angular.isObject(param)) {
            pre != ''
            ? arr = arr.concat(paramsToString(param, pre + '[' + i + ']'))
            : arr = arr.concat(paramsToString(param, i))
          }
          else if (param !== undefined) {
            pre != ''
            ? arr.push(pre, '[', i, ']', '=', param, '&')
            : arr.push(i, '=', param, '&')
          }
        }

        return arr
      }

      return paramsToString(params, '').slice(0, -1).join('')
    }
  }
])