

angular.module('ui.helper', [])

.constant('css3Transform', function() {
  var style = angular.element('<div>')[0].style,
  modes = ['transform', 'MozTransform', 'WebkitTransform', 'OTransform'],
  i;

  for (i = 0; i < modes.length; i ++) {
    if (modes[i] in style) return modes[i];
  }

  return false;
}())

.run(function() {'use strict';
  if (! angular.isFunction(angular.clone)) {
    angular.clone = function(a) {
      if (angular.isObject(a)) return angular.fromJson(angular.toJson(a));
      return a;
    };
  }
  
  // Number Helper
  if (!angular.isFunction(angular.isNumeric)) {
    angular.isNumeric = function(number) {
      return !isNaN(parseFloat(number)) && isFinite(number);
    };
  }

  // Object Helper
  if (!angular.isFunction(angular.isEmptyObject)) {
    angular.isEmptyObject = function(o) {
      var i;
      for (i in o) return !1;
      return !0;
    };
  }

  // Array Helper
  if (!angular.isFunction(angular.inArray)) {
    angular.inArray = function(value, array) {
      if (Array.prototype.indexOf && angular.isFunction(array.indexOf)) {
        return array.indexOf(value);
      }
      else {
        for (var i = 0; i < array.length; i ++) {
          if (array[i] === value) return i;
        }

        return -1;
      }
    };
  }

  if (!angular.isFunction(angular.inArrayBy)) {
    angular.inArrayBy = function(object_or_index, array, index_name) {
      var index;
      if (angular.isObject(object_or_index)) index = object_or_index[index_name];
      else index = object_or_index;

      for (var i = 0; i < array.length; i ++) {
        if (array[i][index_name] == index) return i;
      }

      return -1;
    };
  }

  // Url Helper
  if (!angular.isFunction(angular.parseUrl)) {
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
  }

  if (!angular.isFunction(angular.parseObject)) {
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
  }

  if (!angular.isFunction(angular.parseString)) {
    angular.parseString = function(params) {
      var paramsToString = function(params, pre){
        var arr = [], i;
        if (!angular.isObject(params)) return;

        for (i in params) {
          if(angular.isObject(params[i])) {
            if (pre != '') arr = arr.concat(paramsToString(params[i], pre + '[' + i + ']'));
            else arr = arr.concat(paramsToString(params[i], i));
          }
          else {
            if (pre !='') arr.push(pre, '[', i, ']', '=', params[i], '&');
            else arr.push(i, '=', params[i], '&');
          }
        }

        return arr;
      }

      return paramsToString(params, '').slice(0, -1).join('');
    };
  }

  // Date Helper
  if (!angular.isFunction(angular.dateAdjust)) {
    angular.dateAdjust = function(date, part, amount) {
      part = part.toLowerCase();

      var map = { 
        years: 'FullYear', months: 'Month', weeks: 'Hours', days: 'Hours', hours: 'Hours', 
        minutes: 'Minutes', seconds: 'Seconds', milliseconds: 'Milliseconds',
        utcyears: 'UTCFullYear', utcmonths: 'UTCMonth', utcweeks: 'UTCHours', utcdays: 'UTCHours', 
        utchours: 'UTCHours', utcminutes: 'UTCMinutes', utcseconds: 'UTCSeconds', utcmilliseconds: 'UTCMilliseconds'
      },
      mapPart = map[part];

      if (part == 'weeks' || part == 'utcweeks') amount *= 168;
      if (part == 'days' || part == 'utcdays') amount *= 24;

      var setFucName = 'set' + mapPart,
      getFuncName = 'get'+ mapPart;

      date[setFucName](date[getFuncName]() + amount);      
    };
  }

  if (!angular.isFunction(angular.dateEach)) {
    angular.dateEach = function(beginDate, endDate, part, step, callback, bind) {
      var fromDate = new Date(beginDate.getTime()),
      toDate = new Date(endDate.getTime()),
      pm = fromDate <= toDate ? 1 : -1,
      i = 0;

      while ((pm === 1 && fromDate <= toDate) || (pm === -1 && fromDate >= toDate)) {
        if (callback.call(bind, fromDate, i, beginDate, endDate) === false) break;

        i += step;
        angular.dateAdjust(fromDate, part, step*pm);
      }
    };
  }

  // Sort Helper
  if (!angular.isFunction(angular.quickSort)) {
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
  }

  // Other Helper
  if (! angular.isFunction(angular.namespace)) {
    angular.namespace = function(query, space, token) {
      if ('string' !== typeof query) return undefined;

      var i = 0, re = space, ns = query.split(token || '.');
      for (; i < ns.length; i ++) {
        if ('undefined' === typeof re[ns[i]]) return undefined;
        re = re[ns[i]];
      }

      return 'undefined' === typeof re ? undefined : re;
    };
  }

  if (! angular.isFunction(angular.make)) {
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
  }

  if (! angular.isObject(angular.browser)) {
    angular.browser = (function() {
      var matched, browser,
      uaMatch = function( ua ) {
        ua = ua.toLowerCase();

        var match = /(opr)[\/]([\w.]+)/.exec( ua ) ||
          /(chrome)[ \/]([\w.]+)/.exec( ua ) ||
          /(version)[ \/]([\w.]+).*(safari)[ \/]([\w.]+)/.exec(ua) ||
          /(webkit)[ \/]([\w.]+)/.exec( ua ) ||
          /(opera)(?:.*version|)[ \/]([\w.]+)/.exec( ua ) ||
          /(msie) ([\w.]+)/.exec( ua ) ||
          ua.indexOf("trident") >= 0 && /(rv)(?::| )([\w.]+)/.exec( ua ) ||
          ua.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec( ua ) ||
          [];

        var platform_match = /(ipad)/.exec( ua ) ||
          /(iphone)/.exec( ua ) ||
          /(android)/.exec( ua ) ||
          /(windows phone)/.exec(ua) ||
          /(win)/.exec( ua ) ||
          /(mac)/.exec( ua ) ||
          /(linux)/.exec( ua ) ||
          [];

        return {
          browser: match[ 3 ] || match[ 1 ] || "",
          version: match[ 2 ] || "0",
          platform: platform_match[0] || ""
        };
      };

      matched = uaMatch(window.navigator.userAgent);
      browser = {};

      if (matched.browser) {
        browser[ matched.browser] = true;
        browser.version = matched.version;
          browser.versionNumber = parseInt(matched.version);
      }

      if (matched.platform) {
        browser[ matched.platform] = true;
      }

      // Chrome, Opera 15+ and Safari are webkit based browsers
      if (browser.chrome || browser.opr || browser.safari) {
        browser.webkit = true;
      }

      // IE11 has a new token so we will assign it msie to avoid breaking changes
      if (browser.rv) {
        var ie = 'msie';
        matched.browser = ie;
        browser[ie] = true;
      }

      // Opera 15+ are identified as opr
      if (browser.opr) {
        var opera = 'opera';
        matched.browser = opera;
        browser[opera] = true;
      }

      // Stock Android browsers are marked as safari on Android.
      if (browser.safari && browser.android) {
        var android = 'android';
        matched.browser = android;
        browser[android] = true;
      }

      // Assign the name and platform variable
      browser.name = matched.browser;
      browser.platform = matched.platform;
      return browser;
    })();
  }

  if (! angular.isFunction(angular.md5)) {
    angular.md5 = function(str) {
      //  discuss at: http://phpjs.org/functions/md5/
      // original by: Webtoolkit.info (http://www.webtoolkit.info/)
      // improved by: Michael White (http://getsprink.com)
      // improved by: Jack
      // improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
      //    input by: Brett Zamir (http://brett-zamir.me)
      // bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
      //  depends on: utf8_encode
      //   example 1: md5('Kevin van Zonneveld');
      //   returns 1: '6e658d4bfcb59cc13f96c14450ac40b9'

      var xl;

      var rotateLeft = function(lValue, iShiftBits) {
        return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
      };

      var addUnsigned = function(lX, lY) {
        var lX4, lY4, lX8, lY8, lResult;
        lX8 = (lX & 0x80000000);
        lY8 = (lY & 0x80000000);
        lX4 = (lX & 0x40000000);
        lY4 = (lY & 0x40000000);
        lResult = (lX & 0x3FFFFFFF) + (lY & 0x3FFFFFFF);
        if (lX4 & lY4) {
          return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
        }
        if (lX4 | lY4) {
          if (lResult & 0x40000000) {
            return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
          } else {
            return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
          }
        } else {
          return (lResult ^ lX8 ^ lY8);
        }
      };

      var _F = function(x, y, z) {
        return (x & y) | ((~x) & z);
      };
      var _G = function(x, y, z) {
        return (x & z) | (y & (~z));
      };
      var _H = function(x, y, z) {
        return (x ^ y ^ z);
      };
      var _I = function(x, y, z) {
        return (y ^ (x | (~z)));
      };

      var _FF = function(a, b, c, d, x, s, ac) {
        a = addUnsigned(a, addUnsigned(addUnsigned(_F(b, c, d), x), ac));
        return addUnsigned(rotateLeft(a, s), b);
      };

      var _GG = function(a, b, c, d, x, s, ac) {
        a = addUnsigned(a, addUnsigned(addUnsigned(_G(b, c, d), x), ac));
        return addUnsigned(rotateLeft(a, s), b);
      };

      var _HH = function(a, b, c, d, x, s, ac) {
        a = addUnsigned(a, addUnsigned(addUnsigned(_H(b, c, d), x), ac));
        return addUnsigned(rotateLeft(a, s), b);
      };

      var _II = function(a, b, c, d, x, s, ac) {
        a = addUnsigned(a, addUnsigned(addUnsigned(_I(b, c, d), x), ac));
        return addUnsigned(rotateLeft(a, s), b);
      };

      var convertToWordArray = function(str) {
        var lWordCount;
        var lMessageLength = str.length;
        var lNumberOfWords_temp1 = lMessageLength + 8;
        var lNumberOfWords_temp2 = (lNumberOfWords_temp1 - (lNumberOfWords_temp1 % 64)) / 64;
        var lNumberOfWords = (lNumberOfWords_temp2 + 1) * 16;
        var lWordArray = new Array(lNumberOfWords - 1);
        var lBytePosition = 0;
        var lByteCount = 0;
        while (lByteCount < lMessageLength) {
          lWordCount = (lByteCount - (lByteCount % 4)) / 4;
          lBytePosition = (lByteCount % 4) * 8;
          lWordArray[lWordCount] = (lWordArray[lWordCount] | (str.charCodeAt(lByteCount) << lBytePosition));
          lByteCount++;
        }
        lWordCount = (lByteCount - (lByteCount % 4)) / 4;
        lBytePosition = (lByteCount % 4) * 8;
        lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
        lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
        lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
        return lWordArray;
      };

      var wordToHex = function(lValue) {
        var wordToHexValue = '',
          wordToHexValue_temp = '',
          lByte, lCount;
        for (lCount = 0; lCount <= 3; lCount++) {
          lByte = (lValue >>> (lCount * 8)) & 255;
          wordToHexValue_temp = '0' + lByte.toString(16);
          wordToHexValue = wordToHexValue + wordToHexValue_temp.substr(wordToHexValue_temp.length - 2, 2);
        }
        return wordToHexValue;
      };

      var x = [],
        k, AA, BB, CC, DD, a, b, c, d, S11 = 7,
        S12 = 12,
        S13 = 17,
        S14 = 22,
        S21 = 5,
        S22 = 9,
        S23 = 14,
        S24 = 20,
        S31 = 4,
        S32 = 11,
        S33 = 16,
        S34 = 23,
        S41 = 6,
        S42 = 10,
        S43 = 15,
        S44 = 21;

      str = this.utf8_encode(str);
      x = convertToWordArray(str);
      a = 0x67452301;
      b = 0xEFCDAB89;
      c = 0x98BADCFE;
      d = 0x10325476;

      xl = x.length;
      for (k = 0; k < xl; k += 16) {
        AA = a;
        BB = b;
        CC = c;
        DD = d;
        a = _FF(a, b, c, d, x[k + 0], S11, 0xD76AA478);
        d = _FF(d, a, b, c, x[k + 1], S12, 0xE8C7B756);
        c = _FF(c, d, a, b, x[k + 2], S13, 0x242070DB);
        b = _FF(b, c, d, a, x[k + 3], S14, 0xC1BDCEEE);
        a = _FF(a, b, c, d, x[k + 4], S11, 0xF57C0FAF);
        d = _FF(d, a, b, c, x[k + 5], S12, 0x4787C62A);
        c = _FF(c, d, a, b, x[k + 6], S13, 0xA8304613);
        b = _FF(b, c, d, a, x[k + 7], S14, 0xFD469501);
        a = _FF(a, b, c, d, x[k + 8], S11, 0x698098D8);
        d = _FF(d, a, b, c, x[k + 9], S12, 0x8B44F7AF);
        c = _FF(c, d, a, b, x[k + 10], S13, 0xFFFF5BB1);
        b = _FF(b, c, d, a, x[k + 11], S14, 0x895CD7BE);
        a = _FF(a, b, c, d, x[k + 12], S11, 0x6B901122);
        d = _FF(d, a, b, c, x[k + 13], S12, 0xFD987193);
        c = _FF(c, d, a, b, x[k + 14], S13, 0xA679438E);
        b = _FF(b, c, d, a, x[k + 15], S14, 0x49B40821);
        a = _GG(a, b, c, d, x[k + 1], S21, 0xF61E2562);
        d = _GG(d, a, b, c, x[k + 6], S22, 0xC040B340);
        c = _GG(c, d, a, b, x[k + 11], S23, 0x265E5A51);
        b = _GG(b, c, d, a, x[k + 0], S24, 0xE9B6C7AA);
        a = _GG(a, b, c, d, x[k + 5], S21, 0xD62F105D);
        d = _GG(d, a, b, c, x[k + 10], S22, 0x2441453);
        c = _GG(c, d, a, b, x[k + 15], S23, 0xD8A1E681);
        b = _GG(b, c, d, a, x[k + 4], S24, 0xE7D3FBC8);
        a = _GG(a, b, c, d, x[k + 9], S21, 0x21E1CDE6);
        d = _GG(d, a, b, c, x[k + 14], S22, 0xC33707D6);
        c = _GG(c, d, a, b, x[k + 3], S23, 0xF4D50D87);
        b = _GG(b, c, d, a, x[k + 8], S24, 0x455A14ED);
        a = _GG(a, b, c, d, x[k + 13], S21, 0xA9E3E905);
        d = _GG(d, a, b, c, x[k + 2], S22, 0xFCEFA3F8);
        c = _GG(c, d, a, b, x[k + 7], S23, 0x676F02D9);
        b = _GG(b, c, d, a, x[k + 12], S24, 0x8D2A4C8A);
        a = _HH(a, b, c, d, x[k + 5], S31, 0xFFFA3942);
        d = _HH(d, a, b, c, x[k + 8], S32, 0x8771F681);
        c = _HH(c, d, a, b, x[k + 11], S33, 0x6D9D6122);
        b = _HH(b, c, d, a, x[k + 14], S34, 0xFDE5380C);
        a = _HH(a, b, c, d, x[k + 1], S31, 0xA4BEEA44);
        d = _HH(d, a, b, c, x[k + 4], S32, 0x4BDECFA9);
        c = _HH(c, d, a, b, x[k + 7], S33, 0xF6BB4B60);
        b = _HH(b, c, d, a, x[k + 10], S34, 0xBEBFBC70);
        a = _HH(a, b, c, d, x[k + 13], S31, 0x289B7EC6);
        d = _HH(d, a, b, c, x[k + 0], S32, 0xEAA127FA);
        c = _HH(c, d, a, b, x[k + 3], S33, 0xD4EF3085);
        b = _HH(b, c, d, a, x[k + 6], S34, 0x4881D05);
        a = _HH(a, b, c, d, x[k + 9], S31, 0xD9D4D039);
        d = _HH(d, a, b, c, x[k + 12], S32, 0xE6DB99E5);
        c = _HH(c, d, a, b, x[k + 15], S33, 0x1FA27CF8);
        b = _HH(b, c, d, a, x[k + 2], S34, 0xC4AC5665);
        a = _II(a, b, c, d, x[k + 0], S41, 0xF4292244);
        d = _II(d, a, b, c, x[k + 7], S42, 0x432AFF97);
        c = _II(c, d, a, b, x[k + 14], S43, 0xAB9423A7);
        b = _II(b, c, d, a, x[k + 5], S44, 0xFC93A039);
        a = _II(a, b, c, d, x[k + 12], S41, 0x655B59C3);
        d = _II(d, a, b, c, x[k + 3], S42, 0x8F0CCC92);
        c = _II(c, d, a, b, x[k + 10], S43, 0xFFEFF47D);
        b = _II(b, c, d, a, x[k + 1], S44, 0x85845DD1);
        a = _II(a, b, c, d, x[k + 8], S41, 0x6FA87E4F);
        d = _II(d, a, b, c, x[k + 15], S42, 0xFE2CE6E0);
        c = _II(c, d, a, b, x[k + 6], S43, 0xA3014314);
        b = _II(b, c, d, a, x[k + 13], S44, 0x4E0811A1);
        a = _II(a, b, c, d, x[k + 4], S41, 0xF7537E82);
        d = _II(d, a, b, c, x[k + 11], S42, 0xBD3AF235);
        c = _II(c, d, a, b, x[k + 2], S43, 0x2AD7D2BB);
        b = _II(b, c, d, a, x[k + 9], S44, 0xEB86D391);
        a = addUnsigned(a, AA);
        b = addUnsigned(b, BB);
        c = addUnsigned(c, CC);
        d = addUnsigned(d, DD);
      }

      var temp = wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d);

      return temp.toLowerCase();
    };
  }
})

.filter('range', [
  function() {'use strict';
    return function(input, from, to, step) {
      var arr = [];
      switch (arguments.length) {
      case 1:
        to = from;
        from = 0;
        step = 1;
        break;

      case 2:
      case 3:
        from = from || 0;
        to = to || 0;
        step = step || 1;
        break;

      default:
        return input;
      }

      while (from <= to) {
        arr[arr.length] = from;
        from += step;
      }

      return arr;
    };
  }
])

/**
 * $transition service provides a consistent interface to trigger CSS 3 transitions and to be informed when they complete.
 * @param  {DOMElement} element  The DOMElement that will be animated.
 * @param  {string|object|function} trigger  The thing that will cause the transition to start:
 *   - As a string, it represents the css class to be added to the element.
 *   - As an object, it represents a hash of style attributes to be applied to the element.
 *   - As a function, it represents a function to be called that will cause the transition to occur.
 * @return {Promise}  A promise that is resolved when the transition finishes.
 */
.factory('$transition', [
  '$q', '$timeout', '$rootScope',
  function($q, $timeout, $rootScope) {

  var $transition = function(element, trigger, options) {
    options = options || {};
    var deferred = $q.defer();
    var endEventName = $transition[options.animation ? "animationEndEventName" : "transitionEndEventName"];

    var transitionEndHandler = function(event) {
      $rootScope.$apply(function() {
        element.unbind(endEventName, transitionEndHandler);
        deferred.resolve(element);
      });
    };

    if (endEventName) {
      element.bind(endEventName, transitionEndHandler);
    }

    // Wrap in a timeout to allow the browser time to update the DOM before the transition is to occur
    $timeout(function() {
      if ( angular.isString(trigger) ) {
        element.addClass(trigger);
      } else if ( angular.isFunction(trigger) ) {
        trigger(element);
      } else if ( angular.isObject(trigger) ) {
        element.css(trigger);
      }
      //If browser does not support transitions, instantly resolve
      if ( !endEventName ) {
        deferred.resolve(element);
      }
    });

    // Add our custom cancel function to the promise that is returned
    // We can call this if we are about to run a new transition, which we know will prevent this transition from ending,
    // i.e. it will therefore never raise a transitionEnd event for that transition
    deferred.promise.cancel = function() {
      if ( endEventName ) {
        element.unbind(endEventName, transitionEndHandler);
      }
      deferred.reject('Transition cancelled');
    };

    return deferred.promise;
  };

  // Work out the name of the transitionEnd event
  var transElement = document.createElement('trans');
  var transitionEndEventNames = {
    'WebkitTransition': 'webkitTransitionEnd',
    'MozTransition': 'transitionend',
    'OTransition': 'oTransitionEnd',
    'transition': 'transitionend'
  };
  var animationEndEventNames = {
    'WebkitTransition': 'webkitAnimationEnd',
    'MozTransition': 'animationend',
    'OTransition': 'oAnimationEnd',
    'transition': 'animationend'
  };
  function findEndEventName(endEventNames) {
    for (var name in endEventNames){
      if (transElement.style[name] !== undefined) {
        return endEventNames[name];
      }
    }
  }
  $transition.transitionEndEventName = findEndEventName(transitionEndEventNames);
  $transition.animationEndEventName = findEndEventName(animationEndEventNames);
  return $transition;
}])