

angular.module('ui.helper', [])

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

.service('$css3Style', function() {'use strict';
  var exports = this,
      _elementStyle = document.createElement('div').style,
      _vendor = (function() {
        var vendors = ['OT', 'msT', 'MozT', 'webkit', 't'],
            transform,
            l = vendors.length;

        for (; l > 0; l --) {
          transform = vendors[l] + 'ransform';
          if (transform in _elementStyle) {
            return vendors[l].substr(0, vendors[l].length -1);
          }
        }

        return false;
      })();

  this.prefixStyle = function(style) {
    if (_vendor === false) return false;
    if (_vendor === '') return style;
    return _vendor + style.charAt(0).toUpperCase() + style.substr(1);
  };
})

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
  function($q, $timeout, $rootScope) {'use strict';

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
    var name;
    for (name in endEventNames){
      if (transElement.style[name] !== undefined) {
        return endEventNames[name];
      }
    }
  }
  $transition.transitionEndEventName = findEndEventName(transitionEndEventNames);
  $transition.animationEndEventName = findEndEventName(animationEndEventNames);
  return $transition;
}])

.run(function() {'use strict';
  // number helper
  if (!angular.isFunction(angular.isNumeric)) {
    angular.isNumeric = function(number) {
      return !isNaN(parseFloat(number)) && isFinite(number);
    };
  }

  // object helper
  if (!angular.isFunction(angular.isEmptyObject)) {
    angular.isEmptyObject = function(o) {
      var i;
      for (i in o) return !1;
      return !0;
    };
  }

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

  // array helper
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

  // url helper
  if (!angular.isFunction(angular.stringToParams)) {
    angular.stringToParams = function(str) {
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

  if (!angular.isFunction(angular.paramsToString)) {
    angular.paramsToString = function(params) {
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

  // date helper
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

  // sort helper
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

  // other helper
  if (!angular.isObject(angular.browser)) {
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

    angular.browser.device = (/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent.toLowerCase()));
  }
})