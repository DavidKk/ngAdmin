/*
 * ngAdmin
 * http://a.davidkk.com

 * Version: 0.0.1 - 2014-10-18
 * License: 
 */
angular.module("ui.ngAdmin", ["ui.ngAdmin.tpls", "ui.dropdownMenu","ui.helper","ui.ngScroll","ui.promptBox","ui.scrollpicker","ui.selecter","ui.slideMenu","ui.style","ui.timepicker","ui.warpperSlider","ui.zeroclipboard"]);
angular.module("ui.ngAdmin.tpls", ["tpls/ngScroll/ngScroll.html","tpls/selecter/selecter.html"]);


angular.module('ui.dropdownMenu', [])

.constant('dropdownMenuConfig', {
  openClass: 'open',
  activeClass: 'active',
  hideClass: 'hide'
})

.service('dropdownMenuService', [
  '$document',
  function($document) {
    var openScope;

    function openDropdown() {
      openScope.$apply(function() {
        openScope.isOpen = true;
      });
    }

    function closeDropdown() {
      openScope.$apply(function() {
        openScope.isOpen = false;
      });
    }

    function escapeKeyBind(event) {
      if (event.keyCode === 27) closeDropdown();
      else openScope.onControl(event);
    }

    this.open = function(dropdownScope) {
      if (!openScope) {
        $document.on('click', closeDropdown);
        $document.on('keydown', escapeKeyBind);
      }

      if (openScope && openScope !== dropdownScope) openScope.isOpen = false;

      openScope = dropdownScope;
    };

    this.close = function(dropdownScope) {
      if (openScope === dropdownScope) {
        $document.off('click', closeDropdown);
        $document.off('keydown', escapeKeyBind);
        openScope = null;
      }
    };
  }
])

.controller('DropdownMenuController', [
  '$scope',
  'dropdownMenuService',
  function($scope, dropdownMenuService) {
    var exports = this;
    $scope.isOpen = false;

    exports.toggle = function(open) {
      var args = arguments;
      $scope.$apply(function() {
        $scope.isOpen = args.length ? !!open : !$scope.isOpen;
        exports.$filterElement && setTimeout(function() { exports.$filterElement[0].focus('focus'); }, 300);
      });

      return $scope.isOpen;
    };

    exports.filter = function(filterStr) {
      if (angular.isString(filterStr)) {
        $scope.$apply(function() {
          $scope.filter = filterStr;
        });
      }
    };

    $scope.$watch('isOpen', function(isOpen) {
      $scope.onToggle(!!isOpen);

      if (isOpen) {
        dropdownMenuService.open($scope, exports);
        angular.isFunction(exports.onFocus) && exports.onFocus();
      }
      else dropdownMenuService.close($scope, exports);
    });

    $scope.$watch('filter', function(filter) {
      angular.isString(filter) && $scope.onFilter(filter);
    });

    $scope.$on('$closeDropdown', function() {
      $scope.isOpen = false;
    });
  }
])

.directive('dropdownMenu', [
  'dropdownMenuConfig',
  function(dropdownMenuConfig) {
    return {
      restrict: 'EA',
      controller: 'DropdownMenuController',
      scope: {
        isOpen: '=?',
        filter: '=?'
      },
      link: function($scope, $element, $attrs, ctrl) {

        $scope.onToggle = function(isOpen) {
          $element.toggleClass(dropdownMenuConfig.openClass, isOpen);
        };

        $scope.onFilter = function(filterStr) {
          angular.isFunction(ctrl.onFilter) && ctrl.onFilter(filterStr);
        };

        $scope.onControl = function(event) {
          if (-1 !== angular.inArray(event.keyCode, [38, 40])) {
            event.preventDefault();
            ctrl.onChooseByKey(event.keyCode === 38 ? 'up' : 'down');
          }
          else if (event.keyCode === 13) ctrl.onSelect();
        };
      }
    };
  }
])

.directive('dropdownMenuDialog', [
  'dropdownMenuConfig',
  function(dropdownMenuConfig) {
    return {
      restrict: 'EA',
      require: '?^dropdownMenu',
      link: function($scope, $element, $attrs, ctrl) {
        $element.on('click', function(event) {
          event.stopPropagation();
        });
      }
    };
  }
])

.directive('dropdownMenuFilter', [
  function() {
    return {
      restrict: 'EA',
      require: '^dropdownMenu',
      link: function($scope, $element, $attrs, ctrl) {
        ctrl.$filterElement = $element;

        $element.
        on('click', function(event) {
          event.preventDefault();
          event.stopPropagation();
        }).
        on('keyup', function() {
          var value = $element.val();
          ctrl.filter(value);
        });
      }
    };
  }
])  

.directive('dropdownMenuList', [
  'dropdownMenuConfig',
  function(dropdownMenuConfig) {
    return {
      restrict: 'EA',
      require: '?^dropdownMenu',
      link: function($scope, $element, $attrs, ctrl) {        
        ctrl.onFilter = function(filterStr) {
          if ('string' === typeof filterStr) {
            angular.forEach($element.children(), function(elem) {
              filterStr = filterStr.toLowerCase();

              var text = angular.element(elem).text().toLowerCase(),
              liElem = angular.element(elem);

              if (liElem.hasClass(dropdownMenuConfig.activeClass)) liElem.removeClass(dropdownMenuConfig.hideClass);
              else liElem.toggleClass(dropdownMenuConfig.hideClass, !text.match(filterStr));

              ctrl.onFocus();
            });
          }
        };

        ctrl.onFocus = function() {
          var liElem = $element.children(),
          curElem, offsetTop;

          for (var i = 0; i < liElem.length; i ++) {
            curElem = angular.element(liElem[i]);
            if (curElem.hasClass(dropdownMenuConfig.activeClass)) {
              offsetTop = curElem.prop('offsetTop');
              height = curElem.prop('offsetHeight');

              $element.prop('scrollTop', offsetTop - height - 9);
              break;
            }
          }
        };

        ctrl.onChooseByKey = function(type) {
          var liElem = $element.children(),
          arrElem = [],
          next = type === 'up' ? -1 : 1;

          for (var i = 0, curLiElement; i < liElem.length; i ++) {
            curLiElement = angular.element(liElem[i]);

            if (curLiElement.hasClass(dropdownMenuConfig.hideClass) && !curLiElement.hasClass(dropdownMenuConfig.activeClass)) continue;
            arrElem.push(liElem[i]);
          }

          for (var i = 0, curLiElement, nextLiElement; i < arrElem.length; i ++) {
            curLiElement = angular.element(arrElem[i]);
            nextLiElement = angular.element(arrElem[i + next]);

            if (curLiElement.hasClass(dropdownMenuConfig.activeClass)) {
              if (arrElem[i + next]) {
                curLiElement.removeClass(dropdownMenuConfig.activeClass);
                nextLiElement.addClass(dropdownMenuConfig.activeClass);

                var scrollTop = $element.prop('scrollTop'),
                screenHeight = $element.prop('offsetHeight'),
                offsetTop = nextLiElement.prop('offsetTop'),
                height = nextLiElement.prop('offsetHeight');

                if (offsetTop - height < scrollTop || offsetTop > scrollTop + screenHeight) {
                  if (type === 'up') $element.prop('scrollTop', offsetTop - height -9);
                  else $element.prop('scrollTop', offsetTop - screenHeight);
                }          
              }

              break;
            }
          }
        };

        ctrl.onSelect = function() {
          var liElem = $element.children(),
          curElem, offsetTop;

          for (var i = 0; i < liElem.length; i ++) {
            curElem = angular.element(liElem[i]);
            if (curElem.hasClass(dropdownMenuConfig.activeClass)) {
              curElem.children()[0].click();
              break;
            }
          }
        };

        $element.on('click', function(event) {
          event.stopPropagation();
        });
      }
    };
  }
])

.directive('dropdownMenuToggle', [
  function() {
    return {
      restrict: 'EA',
      require: '^dropdownMenu',
      link: function($scope, $element, $attrs, ctrl) {
        $element.on('click', function(event) {
          event.preventDefault();
          event.stopPropagation();
          !$element.attr('disabled') && !$element.prop('disabled') && ctrl.toggle();
        });
      }
    };
  }
]);

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

.factory('$device', [
  function() {'use strict';
    var exports = {};

    exports.isBadAndroid = /Android /.test(window.navigator.appVersion) && !(/Chrome\/\d/.test(window.navigator.appVersion));
    return exports;
  }
])

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
});

angular.module('ui.ngScroll', [
  'ui.helper', 'ui.style'
])

.controller('ngScrollCtrl', [
  '$scope', '$timeout',
  function($scope, $timeout) {'use strict';
    var exports = this,
    timeoutId;

    $scope.isHorizontal = false;
    $scope.isVertical = true;
    $scope.isFixedLeft = false;
    $scope.isFixedTop = false;
    $scope.easeType = 'bounce';
    $scope.showRails = false;

    $scope.size = {
      maxScrollX: 0,
      maxScrollY: 0,
      wrapW: 1,
      wrapH: 1,
      viewW: 0,
      viewH: 0,
      screenW: 0,
      screenH: 0
    };

    // only for pic
    $scope.railsXP = 0;
    $scope.railsYP = 0;
    $scope.railsWP = 0;
    $scope.railsHP = 0;

    exports.showRails = function(doDigest, autoHide) {
      doDigest = doDigest === undefined ? true : !!doDigest;
      autoHide = autoHide === undefined ? true : !!autoHide;

      timeoutId && $timeout.cancel(timeoutId);
      $scope.showRails = true;
      doDigest && $scope.$digest();

      if (autoHide) {
        timeoutId = $timeout(function() {
          $scope.showRails = false;
        }, 2000);
      }
    };

    exports.hideRails = function() {
      timeoutId && $timeout.cancel(timeoutId);
    };
  }
])

.directive('ngScroll', [
  '$q',
  '$device', 'easing', '$prefixStyle', '$getComputedPosition', '$animateFrame',
  function($q, $device, ease, $prefixStyle, $getComputedPosition, $animateFrame) {
    return {
      restrict: 'EA',
      transclude: true,
      replace: true,
      templateUrl: 'tpls/ngScroll/ngScroll.html',
      controller: 'ngScrollCtrl',
      scope: {},
      link: function($scope, $element, $attrs, ctrl) {'use strict';
        var attrs = $attrs.$attr;
        $scope.isHorizontal = attrs.hasOwnProperty('horizontal') ? !!attrs.horizontal : $scope.isHorizontal;
        $scope.isVertical = attrs.hasOwnProperty('vertical') ? !!attrs.vertical : $scope.isVertical;
        $scope.isFixedLeft = attrs.hasOwnProperty('fixedLeft') ? !!attrs.fixedLeft : $scope.isFixedLeft;
        $scope.isFixedTop = attrs.hasOwnProperty('fixedTop') ? !!attrs.fixedTop : $scope.isFixedTop;
        $scope.easeType = attrs.hasOwnProperty('ease') ? attrs.ease : $scope.easeType;

        // physics deceleration, dest = s0 + vper^2 * 1/2a
        function momentum(current, start, deltaTime, lowerMargin, wrapperSize) {
          var distance = current - start,
              speed = Math.abs(distance) / deltaTime,
              deceleration = 0.0006,
              destination, duration;

          destination = current + (speed * speed) / (2 * deceleration) * (distance < 0 ? -1 : 1);
          duration = speed / deceleration;

          if (destination < lowerMargin) {
            destination = wrapperSize ? lowerMargin - (wrapperSize / 2.5 * (speed / 8)) : lowerMargin;
            distance = Math.abs(destination - current);
            duration = distance / speed;
          }
          else if (destination > 0) {
            destination = wrapperSize ? wrapperSize / 2.5 * (speed / 8) : 0;
            distance = Math.abs(current) + destination;
            duration = distance / speed;
          }

          return {
            destination: Math.round(destination),
            duration: duration
          };
        }

        function transition($elem, trans) {
          $elem.css($prefixStyle('transition'), trans);
        }

        function transitionTimingFunction($elem, easing) {
          $elem.css($prefixStyle('transitionTimingFunction'), easing);
        }

        function transitionTime($elem, time) {
          time = time || 0;
          var _transitionDuration = $prefixStyle('transitionDuration');

          if ($device.isBadAndroid) {
            !time && $elem.css(_transitionDuration, '0.001s');
          }
          else {
            $elem.css(_transitionDuration, time + 'ms');
          }
        }

        function translate($elem, destX, destY) {
          $elem.css($prefixStyle('transform'), 'translate(' + destX + 'px,' + destY + 'px)');
        }

        var animeFuns = [];
        function stopAnime() {
          var i = animeFuns.length;
          if (i === 0) return false;
          while (-- i >= 0) {
            animeFuns[i]();
          }

          animeFuns = [];
        }

        function animation($elem, curX, curY, destX, destY, duration, easingFn, callback) {
          transition($elem, '');

          var startTime = Date.now(),
              destTime = startTime + duration,
              isAnimating = true;

          !(function step() {
            var now = Date.now(),
                _size = $scope.size,
                destinationX, destinationY, easing;

            if (now >= destTime) {
              isAnimating = undefined;
              translate($elem, destX, destY);
              callback && callback();
            }
            else {
              now = (now - startTime)/duration;
              easing = easingFn(now);
              translate($elem, (destX - curX) * easing + curX, (destY - curY) * easing + curY);
              isAnimating && $animateFrame.rAF(step);
            }
          })();

          return function() {
            isAnimating = undefined;
          };
        }

        function scrollTo($elem, curX, curY, destX, destY, duration, easing, callback) {
          var _size = $scope.size,
              animeId;

          if (!duration || easing.style) {
            transitionTimingFunction($elem, easing.style);
            transitionTime($elem, duration);
            translate($elem, destX, destY);

            animeId = setTimeout(function() {
              // transition($elem, '');
              callback && callback();
            }, duration);

            animeFuns.push(function() {
              clearTimeout(animeId);
              animeId = undefined;
            });
          }
          else if (easing.fn) {
            var stopFn = animation($elem, curX, curY, destX, destY, duration, easing.fn, callback);
            animeFuns.push(stopFn);
          }
        }

        // resize slider
        $scope.$watch(function() {
          var _size = $scope.size,
              content = ctrl.getContent(),
              element = content.$element[0],
              size = content.getSize();

          angular.extend(_size, {
            wrapW: size.width,
            wrapH: size.height,
            viewW: element.clientWidth,
            viewH: element.clientHeight
          });

          return JSON.stringify(_size);
        }, function() {
          var _size = $scope.size,
              viewport = $element[0];

          _size.screenW = viewport.clientWidth;
          _size.screenH = viewport.clientHeight;

          _size.maxScrollX = -(_size.wrapW - _size.screenW);
          _size.maxScrollY = -(_size.wrapH - _size.screenH);

          $scope.isHorizontal && ctrl.getHorzSlider().resize();
          $scope.isVertical && ctrl.getVertSlider().resize();
          ctrl.showRails(false);
        });

        // mobile touch
        $element
        .on('touchstart pointerdown MSPointerDown', function(event) {
          ctrl.showRails();

          var $content = ctrl.getContent().$element,
              $horzSlider = ctrl.getHorzSlider().$element,
              $vertSlider = ctrl.getVertSlider().$element,
              touch = event.touches ? event.touches[0] : event,
              startX = touch.pageX,
              startY = touch.pageY,
              point = $getComputedPosition($content),
              beginX = parseInt(point.x) || 0,
              beginY = parseInt(point.y) || 0,
              startTime = Date.now(),
              curX = beginX,
              curY = beginY;

          stopAnime();
          transition($content, '');
          translate($content, beginX, beginY);
          $scope.isHorizontal && transition($horzSlider, '') || translate($horzSlider, -curX * $scope.railsWP, 0);
          $scope.isVertical && transition($vertSlider, '') || translate($vertSlider, 0, -curY * $scope.railsHP);

          var move = function(event) {
            ctrl.showRails();

            var _size = $scope.size,
                wrapW = _size.wrapW,
                wrapH = _size.wrapH,
                touch = event.touches ? event.touches[0] : event,
                endX = touch.pageX,
                endY = touch.pageY,
                deltaX = endX - startX,
                deltaY = endY - startY;

            curX = $scope.isHorizontal ? curX + deltaX : 0;
            curY = $scope.isVertical ? curY + deltaY : 0;

            translate($content, curX, curY);
            $scope.isHorizontal && translate($horzSlider, -Math.min(Math.max(curX, _size.maxScrollX), 0) * $scope.railsWP, 0);
            $scope.isVertical &&translate($vertSlider, 0, -Math.min(Math.max(curY, _size.maxScrollY), 0) * $scope.railsHP);

            startX = endX;
            startY = endY;
          };

          var end = function(event) {
            var _size = $scope.size,
                duration = Date.now() - startTime,
                absDeltaX = Math.abs(curX - beginX),
                absDeltaY = Math.abs(curY - beginY),
                destX = curX,
                destY = curY,
                momentumX, momentumY;

            destX = Math.min(Math.max(destX, _size.maxScrollX), 0);
            destY = Math.min(Math.max(destY, _size.maxScrollY), 0);

            if (destX === curX && destY === curY) {
              if (duration < 300) {
                momentumX = $scope.isHorizontal ? momentum(curX, beginX, duration, _size.maxScrollX, _size.screenW) : { destination: curX, duration: 0 };
                momentumY = $scope.isVertical ? momentum(curY, beginY, duration, _size.maxScrollY, _size.screenH) : { destination: curY, duration: 0 };
                destX = momentumX.destination;
                destY = momentumY.destination;
                duration = Math.max(momentumX.duration, momentumY.duration);

                ctrl.showRails(true, false);
                scrollTo($content, curX, curY, destX, destY, duration, ease.quadratic, function() {
                  curX = destX;
                  curY = destY;

                  destX = Math.min(Math.max(destX, _size.maxScrollX), 0);
                  destY = Math.min(Math.max(destY, _size.maxScrollY), 0);

                  destX !== curX || destY !== curY &&
                  scrollTo($content, curX, curY, destX, destY, ease[$scope.easeType].time || duration, ease[$scope.easeType], function() {
                    transition($content, '');
                    ctrl.hideRails();
                  });
                });

                $scope.isHorizontal && scrollTo($horzSlider, -destX * $scope.railsWP, 0, -Math.min(Math.max(destX, _size.maxScrollX), 0) * $scope.railsWP, 0, duration, ease.quadratic, function() {
                  transition($horzSlider, '');
                });
                $scope.isVertical && scrollTo($vertSlider, 0, -destY * $scope.railsHP, 0, -Math.min(Math.max(destY, _size.maxScrollY), 0) * $scope.railsHP, duration, ease.quadratic, function() {
                  transition($vertSlider, '');
                });
              }
            }
            else {
              // over the top/bottom
              ctrl.showRails(true, false);
              scrollTo($content, curX, curY, destX, destY, ease[$scope.easeType].time || duration, ease[$scope.easeType], ctrl.hideRails);
            }

            angular.element(window)
            .off('touchmove pointermove MSPointerMove', move)
            .off('touchend pointerup MSPointerUp touchcancel pointercancel MSPointerCancel', end);
          };

          angular.element(window)
          .on('touchmove pointermove MSPointerMove', move)
          .on('touchend pointerup MSPointerUp touchcancel pointercancel MSPointerCancel', end);
        });

        // pc mouse wheel
        $element
        .on('mouseenter', ctrl.showRails)
        .on('mousewheel', function(event) {
          ctrl.showRails();

          var $content = ctrl.getContent().$element,
              _size = $scope.size,
              wrapW = _size.wrapW,
              wrapH = _size.wrapH,
              point = $getComputedPosition($content),
              beginX = parseInt(point.x) || 0,
              beginY = parseInt(point.y) || 0,
              deltaX = event.wheelDeltaX,
              deltaY = event.wheelDeltaY;

          stopAnime();
          transition($content, '');

          if ($scope.isHorizontal && deltaX !== 0) {
            var maxRailsWP = 1 - $scope.railsWP,
                $horzSlider = ctrl.getHorzSlider().$element;

            $scope.railsXP -= deltaX/wrapW;
            $scope.railsXP = Math.max(Math.min($scope.railsXP, maxRailsWP), 0);
            translate($horzSlider, $scope.railsXP * _size.screenW, 0);
          }

          if ($scope.isVertical && deltaY !== 0) {
            var maxRailsHP = 1 - $scope.railsHP,
                $vertSlider = ctrl.getVertSlider().$element;

            $scope.railsYP -= deltaY/wrapH;
            $scope.railsYP = Math.max(Math.min($scope.railsYP, maxRailsHP), 0);
            translate($vertSlider, 0, $scope.railsYP * _size.screenH);
          }

          translate($content, -$scope.railsXP * wrapW, -$scope.railsYP * wrapH);
        });
      }
    };
  }
])

.directive('ngScrollContent', [
  function() {
    return {
      restrict: 'A',
      require: '?^ngScroll',
      link: function($scope, $element, $attrs, ctrl) {'use strict';
        var exports = {};
        exports.args = Array.prototype.slice.call(arguments, 0, arguments.length);
        exports.$element = $element;
        exports.getSize = function() {
          var el = $element[0];
          return {
            width: el.clientWidth,
            height: el.clientHeight
          };
        };

        ctrl.getContent = function() {
          return exports;
        };
      }
    };
  }
])

.directive('ngScrollSlider', [
  '$prefixStyle', '$getComputedPosition',
  function($prefixStyle, $getComputedPosition) {
    return {
      restrict: 'A',
      require: '?^ngScroll',
      link: function($scope, $element, $attrs, ctrl) {'use strict';
        var isHorizontal = $attrs.$attr.hasOwnProperty('horizontal'),
            isVertical = $attrs.$attr.hasOwnProperty('vertical'),
            method;

        if (isHorizontal) method = 'getHorzSlider';
        else if (isVertical) method = 'getVertSlider';
        else return false;

        function translate($elem, destX, destY) {
          $elem.css($prefixStyle('transform'), 'translate(' + destX + 'px,' + destY + 'px)');
        }

        var exports = {};
        exports.args = Array.prototype.slice.call(arguments, 0, arguments.length);
        exports.$element = $element;
        exports.resize = (function() {
          var _size = $scope.size;
          if (isHorizontal) {
            return function() {
              var radioW = _size.screenW/_size.wrapW;
              $scope.railsWP = angular.isNumeric(radioW) ? radioW : 1;
              $scope.railsWP = Math.max(Math.min($scope.railsWP, 1), 0);
              $element.css('width', $scope.railsWP * 100 + '%');
            };
          }
          
          if (isVertical) {
            return function() {
              var radioH = _size.screenH/_size.wrapH;
              $scope.railsHP = angular.isNumeric(radioH) ? radioH : 1;
              $scope.railsHP = Math.max(Math.min($scope.railsHP, 1), 0);
              $element.css('height', $scope.railsHP * 100 + '%');
            };
          }
        })();

        angular.element(window)
        .on('resize', exports.resize);

        ctrl[method] = function() {
          return exports;
        };

        // PC drag
        $element.
        on('mousedown', function(event) {
          var $content = ctrl.getContent().$element,
              point = $getComputedPosition($element),
              curX = parseInt(point.x) || 0,
              curY = parseInt(point.y) || 0,
              startX = event.pageX,
              startY = event.pageY,
              prnt = $content.parent()[0],
              prntW = prnt.clientWidth,
              prntH = prnt.clientHeight;

          var move = function(event) {
            ctrl.showRails();

            var _size = $scope.size,
                endX = event.pageX,
                endY = event.pageY,
                deltaX = endX - startX,
                deltaY = endY - startY,
                wrapW = _size.wrapW,
                wrapH = _size.wrapH;

            curX += deltaX;
            curY += deltaY;
            startX = endX;
            startY = endY;

            if ($scope.isHorizontal && deltaY !== 0) {
              var maxRailsWP = 1 - $scope.railsWP;
              $scope.railsXP += deltaX/prntW;
              $scope.railsXP = Math.max(Math.min($scope.railsXP, maxRailsWP), 0);
              translate($element, $scope.railsXP * _size.screenW, 0);
            }

            if ($scope.isVertical && deltaY !== 0) {
              var maxRailsHP = 1 - $scope.railsHP;
              $scope.railsYP += deltaY/prntH;
              $scope.railsYP = Math.max(Math.min($scope.railsYP, maxRailsHP), 0);
              translate($element, 0, $scope.railsYP * _size.screenH);
            }

            translate($content, -$scope.railsXP * wrapW, -$scope.railsYP * wrapH);
          };

          var end = function() {
            angular.element(window)
            .off('mousemove', move)
            .off('mouseup', end);
          };

          angular.element(window)
          .on('mousemove', move)
          .on('mouseup', end);
        });
      }
    };
  }
]);

angular.module('ui.promptBox', [])

.constant('promptBoxConfig', {
  leaveClass: 'leave',
  enterClass: 'in',
  activeClass: 'active',
  delayTime: 3000
})

.service('$promptStack', [
  '$rootScope',
  function($rootScope) {
    var stackedMap = [], openScopes = [];
    this.createNew = function(openScope) {
      stackedMap = angular.isArray(openScope.notice) ? openScope.notice : (openScope.notice = []);
    };

    this.add = function(scope) {
      openScopes.push(scope);
      if (openScopes.length > 5) {
        var i, l = openScopes.length - 5;
        for (i = 0; i < l; i ++) openScopes[i].leave();
      }
    };

    this.dismiss = function(scope) {
      var index = angular.inArray(scope, openScopes);
      openScopes.splice(index, 1);
      stackedMap.splice(index, 1);
    };

    $rootScope.$on('notify', function(event, message, type, title) {
      stackedMap.push({ message: message, type: type, title: title });
    });
  }
])

.directive('promptBox', [
  '$timeout', '$q',
  '$promptStack',
  'promptBoxConfig',
  function($timeout, $q, $promptStack, config) {
    return {
      restrict: 'EA',
      link: function($scope, $element, $attrs) {
        $promptStack.add($scope);

        var transitionPromise,
        timeoutPromise;
        $scope.isClosed = false;

        $scope.fade = function() {
          var callbackDeferred = $q.defer();
          $timeout(function() {
            $element.addClass(config.enterClass);
          });

          $timeout(function() {
            callbackDeferred.resolve();
          }, 500);

          return callbackDeferred.promise;
        };

        $scope.leave = function(event) {
          if ($scope.isClosed) return false;
          if (!event) $scope.isClosed = true;
          $element.addClass(config.leaveClass);

          // 时间等于 css animation 时间
          // 若使用$timeout 会导致 fadeout 期间不断更改信息集合 notice, 而出现闪屏现象
          timeoutPromise = setTimeout(function() {
            $element.remove();
            $promptStack.dismiss($scope);
          }, 500);
        };

        $scope.pause = function() {
          $element.removeClass(config.leaveClass);
          transitionPromise && $timeout.cancel(transitionPromise);
          timeoutPromise && clearTimeout(timeoutPromise);
          transitionPromise = timeoutPromise = undefined;
        };

        $scope.$watch('isClosed', function(value) {
          if (value === true) $scope.leave();
          else $scope.pause();
        });

        $element.on('mouseenter', function() {
          if ($scope.isClosed) return false;
          $scope.pause();
        });

        $element.on('mouseleave', function() {
          if ($scope.isClosed) return false;

          $scope.pause();
          transitionPromise = $timeout(function() {
            $scope.leave(true);
          }, config.delayTime);
        });

        $scope.fade().
        then(function() {
          $element.triggerHandler('mouseleave');
        });
      }
    };
  }
]);

angular.module('ui.scrollpicker', ['ui.helper'])

.controller('ScrollpickerController', [
  '$scope', '$transition',
  'const-css3Transform',
  function($scope, $transition, css3Transform) {
    var exports = this,
    $list, $picker;

    $scope.next = function(event) {
      event && event.preventDefault();
      if (angular.isUndefined($picker)) return;

      var $next = $picker.next();
      $next.length > 0 && exports.select($next);
    };

    $scope.prev = function(event) {
      event && event.preventDefault();
      if (angular.isUndefined($picker)) return;

      var $prev = $picker.prev();
      $prev.length > 0 && exports.select($prev);
    };

    $scope.select = function(event) {
      var $select = angular.element(event.target);
      $select.length > 0 && exports.select($select);
    };

    exports.setPicker = function($element) {
      $list = $element;
    };

    exports.select = function($element) {
      if ($picker === $element) return;
      if ($picker) $picker.removeClass('selected');
      $element.addClass('selected');
      $picker = $element;

      var items = $list.children(),
      index = angular.inArray($element[0], items),
      height = $element[0].offsetHeight,
      offset = 'translate3d(0, ' + (-(index -1) * height) + 'px, 0)',
      $item;

      var style = {};
      style[css3Transform] = offset;
      $transition($list, style);
    };
  }
])

.directive('scrollpicker', [
  function() {
    return {
      restrict: 'EA',
      transclude: true,
      replace: true,
      controller: 'ScrollpickerController',
      templateUrl: 'template/scrollpicker/scrollpicker.html',
      require: '^scrollpicker',
      scope: {}
    };
  }
])

.directive('scrollList', [
  function() {
    return {
      restrict: 'EA',
      require: '^scrollpicker',
      scope: {},
      link: function($scope, $element, $attrs, scrollpickerCtrl) {
        scrollpickerCtrl.setPicker($element);
      }
    };
  }
])

.directive('scrollItem', [
  function() {
    return {
      restrict: 'EA',
      require: '^scrollpicker',
      link: function($scope, $element, $attrs, scrollpickerCtrl) {
        $element.on('click', function() {
          scrollpickerCtrl.select($element);
        });

        setTimeout(function() {
          $element.hasClass('default') && scrollpickerCtrl.select($element);
        }, 300);
      }
    };
  }
]);

angular.module('ui.selecter', ['ui.helper', 'ui.dropdownMenu'])

.controller('selectpickerController', [
  '$scope', '$document',
  function($scope, $document) {
    $scope.options = [];
    $scope.selected = {};

    $scope.select = function(value) {
      var key = angular.inArrayBy(value, $scope.options, 'value');
      if (-1 !== key) $scope.selected = $scope.options[key];
      setTimeout(function() { $document.triggerHandler('click'); }, 10);
    };
  }
])

.directive('selecter', [
  '$http', '$compile',
  function($http, $compile) {
    return {
      restrict: 'EA',
      transclude: true,
      replace: true,
      controller: 'selectpickerController',
      templateUrl: 'templates/selecter/selecter.html',
      require: ['selecter', '?ngModel'],
      scope: {
        options: '=?'
      },
      link: function($scope, $element, $attrs, ctrls, transclude) {
        var ngModel = ctrls[1],
        $selectElement = $element.children().
        prepend(transclude()).
        find('select').
        css('display', 'none');

        $scope.selected = { text: $element.attr('placeholder'), value: '' };
        $scope.$watch(function() { return $selectElement.html(); }, function() {
          var value, text;

          $scope.options = [];
          angular.forEach($selectElement.children(), function(option) {
            value = angular.element(option).val();
            text = angular.element(option).html();
            text && value && $scope.options.push({ value: value, text: text });
          });
        });

        ngModel && $scope.$watch(function() { return ngModel.$viewValue; }, function(value) {
          var index = angular.inArrayBy(value, $scope.options, 'value');
          if (-1 === index) $scope.selected = { text: $element.attr('placeholder'), value: '' };
          else $scope.selected = $scope.options[index];
        });

        $scope.$watch(function() { return angular.fromJson($scope.selected); }, function() {
          $scope.selected && $selectElement.val($scope.selected.value);
          ngModel && ngModel.$setViewValue($scope.selected.value);
        });
      }
    };
  }
]);

angular.module('ui.slideMenu', [])

.constant('slideMenuConfig', {
  openClass: 'open'
})

.controller('SlideMenuController', [
  '$rootScope', '$scope',
  function($rootScope, $scope) {
    $scope.isOpen;
    this.openScope = $scope;

    this.toggle = function(isOpen) {
      var args = arguments;
      $scope.$apply(function() {
        $scope.isOpen = args.length ? !!isOpen : !$scope.isOpen;
      });

      return $scope.isOpen;
    };

    $scope.$watch('isOpen', function(isOpen) {
      if (angular.isDefined(isOpen)) {
        angular.isFunction($scope.onToggle) && $scope.onToggle(!!isOpen);
        angular.isFunction($scope.onSlide) && $scope.onSlide(!!isOpen);
      }
    });

    $scope.$on('$close', function() {
      $scope.isOpen = false;
    });
  }
])

.controller('SlideMenuGroupController', [
  '$scope',
  function($scope) {
    var menuScopes = [];

    this.closeOthers = function(openScope) {
      angular.forEach(menuScopes, function(scope) {
        if (scope !== openScope) scope.isOpen = false;
      });
    };

    this.addMenuScope = function(openScope) {
      menuScopes.push(openScope);
    };
  }
])

.directive('slideMenu', [
  'slideMenuConfig',
  function(slideMenuConfig) {
    return {
      controller: 'SlideMenuController',
      scope: {
        isOpen: '=?'
      },
      require: ['^slideMenu', '^?slideMenuGroup'],
      link: function($scope, $element, $attrs, ctrls) {
        var groupCtrl = ctrls[1];
        groupCtrl && groupCtrl.addMenuScope($scope);

        $scope.isOpen = $attrs.open == 'true' ? true : false;

        $scope.onToggle = function(isOpen) {
          $element.toggleClass(slideMenuConfig.openClass, isOpen);
          isOpen && groupCtrl && groupCtrl.closeOthers($scope);
        };
      }
    };
  }
])

.directive('slideMenuGroup', [
  function() {
    return {
      restrict: 'CA',
      controller: 'SlideMenuGroupController'
    };
  }
])

.directive('slideMenuList', [
  '$transition',
  function($transition) {
    return {
      require: '^slideMenu',
      link: function($scope, $element, $attrs, ctrls) {
        var openScope = ctrls.openScope,
        initialAnimSkip = true,
        currentTransition;

        function doTransition(change) {
          var newTransition = $transition($element, change);
          if (currentTransition) currentTransition.cancel();

          currentTransition = newTransition;
          newTransition.then(newTransitionDone, newTransitionDone);
          return newTransition;

          function newTransitionDone() {
            // Make sure it's this transition, otherwise, leave it alone.
            if (currentTransition === newTransition) {
              currentTransition = undefined;
            }
          }
        }

        function expandDone() {
          $element.removeClass('collapsing');
          $element.addClass('collapse in');
          $element.css({height: 'auto'});
        }

        function collapseDone() {
          $element.removeClass('collapsing');
          $element.addClass('collapse');
        }

        function expand() {
          if (initialAnimSkip) {
            initialAnimSkip = false;
            expandDone();
          }
          else {
            $element.removeClass('collapse').addClass('collapsing');
            doTransition({ height: $element[0].scrollHeight + 'px' }).then(expandDone);
          }
        }

        function collapse() {
          if (initialAnimSkip) {
            initialAnimSkip = false;
            collapseDone();
            $element.css({height: 0});
          }
          else {
            // CSS transitions don't work with height: auto, so we have to manually change the height to a specific value
            $element.css({ height: $element[0].scrollHeight + 'px' });
            // trigger reflow so a browser realizes that height was updated from auto to a specific value
            var x = $element[0].offsetWidth;
            $element.removeClass('collapse in').addClass('collapsing');
            doTransition({ height: 0 }).then(collapseDone);
          }
        }

        openScope.onSlide = function(isOpen) {
          isOpen ? expand() : collapse();
        };
      }
    };
  }
])

.directive('slideMenuToggle', [
  '$document',
  function($document) {
    return {
      require: '^slideMenu',
      link: function($scope, $element, $attrs, ctrl) {
        $element.on('click', function(event) {
          event.preventDefault();
          event.stopPropagation();

          !$element.attr('disabled') && !$element.prop('disabled') && ctrl.toggle();
          setTimeout(function() { $document.triggerHandler('click'); }, 10);
        });
      }
    };
  }
]);

angular.module('ui.style', [])

.constant('easing', {
  quadratic: {
    name: 'quadratic',
    style: 'cubic-bezier(.25, .46, .45, .94)',
    fn: function(k) {
      return k * (2 - k);
    }
  },
  circular: {
    name: 'circular',
    style: 'cubic-bezier(.1, .57, .1, 1)', // Not properly "circular" but this looks better, it should be (.075, .82, .165, 1)
    fn: function(k) {
      return Math.sqrt(1 - (-- k * k));
    }
  },
  back: {
    name: 'back',
    style: 'cubic-bezier(.175, .885, .32, 1.275)',
    fn: function(k) {
      var b = 4;
      return (k = k - 1) * k * ((b + 1) * k + b) + 1;
    }
  },
  bounce: {
    name: 'bounce',
    style: '',
    time: 600,
    fn: function(k) {
      if ((k /= 1) < (1/2.75)) return 7.5625 * k * k;
      if (k < (2/2.75)) return 7.5625 * (k -= (1.5/2.75)) * k + 0.75;
      if (k < (2.5/2.75)) return 7.5625 * (k -= (2.25/2.75 )) * k + 0.9375;
      return 7.5625 * (k -= (2.625/2.75)) * k + 0.984375;
    }
  },
  elastic: {
    name: 'elastic',
    style: '',
    fn: function(k) {
      var f = 0.22,
          e = 0.4;

      if ( k === 0 ) return 0;
      if ( k == 1 ) return 1;
      return (e * Math.pow(2, - 10*k) * Math.sin((k - f/4) * (2 * Math.PI) / f) + 1);
    }
  }
})

.factory('$prefixStyle', [
  function() {'use strict';
    var _elementStyle = document.createElement('div').style,
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

    return function(style) {
      if (_vendor === false) return false;
      if (_vendor === '') return style;
      return _vendor + style.charAt(0).toUpperCase() + style.substr(1);
    };
  }
])

.factory('$animateFrame', [
  function() {'use strict';
    var rAF = (window.requestAnimationFrame && window.requestAnimationFrame.bind(window)) ||
      (window.webkitRequestAnimationFrame && window.webkitRequestAnimationFrame.bind(window)) ||
      (window.mozRequestAnimationFrame && window.mozRequestAnimationFrame.bind(window)) ||
      (window.oRequestAnimationFrame && window.oRequestAnimationFrame.bind(window)) ||
      (window.msRequestAnimationFrame && window.msRequestAnimationFrame.bind(window)) ||
      function (callback) {
        return window.setTimeout(callback, 1000 / 60);
      };

    var cAF = (window.cancelAnimationFrame && window.cancelAnimationFrame.bind(window)) ||
      (window.webkitCancelAnimationFrame && window.webkitCancelAnimationFrame.bind(window)) ||
      (window.mozCancelAnimationFrame && window.mozCancelAnimationFrame.bind(window)) ||
      (window.oCancelAnimationFrame && window.oCancelAnimationFrame.bind(window)) ||
      (window.msCancelAnimationFrame && window.msCancelAnimationFrame.bind(window)) ||
      function(id) {
        return clearTimeout(id);
      };

    var $animate = function(animate) {
      var isAnimating = true,
          deferred = $q.defer();

      !(function step() {
        if (isAnimating === true && false !== animate()) rAF(step);
        else deferred.reslove();
      });

      deferred.promise.cancel = function() {
        isAnimating = undefined;
        deferred.reject('Animateframe cancelled');
      };

      return deferred.promise;
    };

    $animate.rAF = $animate.requestAnimationFrame = rAF;
    $animate.cAF = $animate.cancelAnimationFrame = cAF;
    return $animate;
  }
])

.factory('$transition', [
  '$q', '$timeout', '$rootScope',
  '$prefixStyle',
  function($q, $timeout, $rootScope, $prefixStyle) {'use strict';
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

      if (endEventName) element.bind(endEventName, transitionEndHandler);

      $timeout(function() {
        if (angular.isString(trigger)) element.addClass(trigger);
        else if (angular.isFunction(trigger)) trigger(element);
        else if (angular.isObject(trigger)) element.css(trigger);
        if (!endEventName) deferred.resolve(element);
      });

      deferred.promise.cancel = function() {
        if (endEventName) element.unbind(endEventName, transitionEndHandler);
        deferred.reject('Transition cancelled');
      };

      return deferred.promise;
    };

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
  }
])

.service('$getComputedPosition', [
  '$prefixStyle',
  function($prefixStyle) {
    return function($elem) {
      var matrix = window.getComputedStyle($elem[0], null),
          x, y;

      matrix = matrix[$prefixStyle('transform')];
      if (matrix && matrix !== 'none') {
        matrix = matrix.split(')')[0].split(', ');
        x = +(matrix[12] || matrix[4]);
        y = +(matrix[13] || matrix[5]);
        return { x: x, y: y };
      }

      return {};
    };
  }
]);

angular.module('ui.timepicker', ['ui.helper', 'ui.scrollpicker'])

.constant('const-weeks', ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'])
.constant('const-dvisions', ['AM', 'PM'])

.controller('TimepickerController', [
  '$scope',
  'const-weeks', 'const-dvisions',
  function($scope, constWeeks, constDvisions) {
    var exports = this,
    hours = [];

    $scope.dates = [];
    $scope.fullHours = [];
    $scope.hours = {};
    $scope.hours[constDvisions[0]] = [];
    $scope.hours[constDvisions[1]] = [];
    $scope.minutes = [];
    $scope.seconds = [];
    $scope.dvisions = [];
    $scope.selects = [];

    var cleanSplitHours = function() {
      var amh = $scope.hours[constDvisions[0]],
      pmh = $scope.hours[constDvisions[1]];

      amh.splice(0, amh.length);
      pmh.splice(0, pmh.length);
    };

    var splitHours = function() {
      cleanSplitHours();

      var amh = $scope.hours[constDvisions[0]],
      pmh = $scope.hours[constDvisions[1]],
      h;

      angular.forEach($scope.fullHours, function(hour) {
        if (Number(hour) < 12) amh.push(hour);
        else pmh.push(hour == 12 ? 12 : hour -12);
      });
    };

    exports.addDates = function(begin_or_dates, until) {
      var week, year, month, date, key;
      if (arguments.length > 1) {
        var begin = begin_or_dates;

        if (begin instanceof Date && until instanceof Date) {
          var week, year, month, date, key;
          angular.dateEach(begin, until, 'days', 1, function(loopDate, times) {
            year = loopDate.getFullYear();
            month = loopDate.getMonth();
            date = loopDate.getDate();
            day = loopDate.getDay();
            key = parseInt(loopDate.getTime()/(1000*60*60*24));

            $scope.dates.push({
              key: key,
              year: year,
              month: month +1,
              date: date,
              day: day,
              week: constWeeks[day]
            });
          });

          angular.quickSort($scope.dates, false, 'key');
        }        
      }
      else if (begin_or_dates instanceof Date) {
        var inDate = begin_or_dates,
        i, flag;

        key = parseInt(inDate.getTime()/(1000*60*60*24));
        for (i = 0, dates = $scope.dates; i < dates.length; i ++) {
          if (dates.key === key) {
            flag = false;
            break;
          }
        }

        if (flag !== false) {
          year = inDate.getFullYear();
          month = inDate.getMonth();
          date = inDate.getDate();
          day = inDate.getDay();

          $scope.dates.push({
            key: key,
            year: year,
            month: month +1,
            date: date,
            day: day,
            week: constWeeks[day]
          });

          angular.quickSort($scope.dates, false, 'key');
        }
      }
      else if (angular.isArray(begin_or_dates)) {
        var arr = [],
        dates = begin_or_dates;

        angular.forEach(dates, function(date) {
          exports.addDates(date);
        });
      }
    };

    exports.delDates = function(begin_or_dates_or_type, until) {
      var key;
      if (arguments.length > 1) {
        var begin = begin_or_dates_or_type;
        if (begin instanceof Date && until instanceof Date) {
          angular.dateEach(begin, until, 'days', 1, function(loopDate) {
            key = parseInt(loopDate.getTime()/(1000*60*60*24));

            for (var i = 0; i < $scope.dates; i ++) {
              if ($scope.dates[i].key === key) {
                $scope.dates.splice(i, 1);
                break;
              }
            }
          });
        }
      }
      else if (begin_or_dates_or_type === 'weekend') {
        for (var i = 0, dates = $scope.dates; i < dates.length; i ++) {
          if (dates[i].day === 0 || dates[i].day === 6) {
            $scope.dates.splice(i, 1);
            i --;
          }
        }
      }
      else if (begin_or_dates_or_type instanceof Date) {
        var date = begin_or_dates_or_type,
        i, dates;
        key = parseInt(date.getTime()/(1000*60*60*24));

        for (i = 0, dates = $scope.dates; i < dates.length; i ++) {
          if (dates[i].key === key) {
            $scope.dates.splice(i, 1);
            break;
          }
        }
      }
      else if (angular.isArray(begin_or_dates_or_type)) {
        var dates = begin_or_dates_or_type;
        angular.forEach(dates, function(date) {
          exports.delDates(date);
        });
      }
    };

    exports.cleanDates = function() {
      $scope.dates.splice(0, $scope.dates.length);
    };

    exports.setDates = function(begin_or_dates, until) {
      exports.cleanDates();
      exports.addDates.apply(exports, arguments);
    };

    exports.addHours = function(begin_or_hours, until, step) {
      step = step || 1;

      var hours = [];
      if (arguments.length > 1) {
        for (var i = parseInt(begin_or_hours), j = parseInt(until); i <= j; i += step) {
          hours.push(i);
        }

        exports.addHours(hours);
      }
      else {
        hours = angular.isArray(begin_or_hours) ? begin_or_hours : [begin_or_hours];
        angular.forEach(hours, function(hour) {
          minute = parseInt(hour);
          if (0 < hour && hour < 24) {
            if (-1 === angular.inArray(hour, $scope.hours)) {
              $scope.fullHours.push(hour);
            }
          }
        });        

        angular.quickSort($scope.fullHours, false);
      }

      splitHours();
    };

    exports.delHours = function(begin_or_hours, until, step) {
      step = step || 1;
      var hours = [];
      if (arguments.length > 1) {
        for (var i = parseInt(begin_or_hours), j = parseInt(until); i <= j; i += step) {
          hours.push(i);
        }

        exports.delHours(hours);
      }
      else {
        hours = angular.isArray(begin_or_hours) ? begin_or_hours : [begin_or_hours];

        var index, i, hours;
        for (i = 0, hours = $scope.fullHours; i < hours.length; i ++) {
          var index = angular.inArray(hours[i], $scope.fullHours);
          if (-1 !== index) $scope.fullHours.splice(index, 1);
          i --;
        }      
      }

      splitHours();
    };

    exports.cleanHours = function() {
      $scope.fullHours.splice(0, $scope.fullHours.length);
      cleanSplitHours();
    };

    exports.setHours = function() {
      exports.delHours();
      exports.addHours.apply(exports, arguments);
    };

    exports.addMinutes = function(begin_or_minutes, until, step) {
      step = step || 1;

      var minutes = [];
      if (arguments.length > 1) {
        for (var i = parseInt(begin_or_minutes), j = parseInt(until); i <= j; i += step) {
          minutes.push(i);
        }

        exports.addMinutes(minutes);
      }
      else {
        minutes = angular.isArray(begin_or_minutes) ? begin_or_minutes : [begin_or_minutes];
        angular.forEach(minutes, function(minute) {
          minute = parseInt(minute);
          if (0 <= minute && minute < 60) {
            if (-1 === angular.inArray(minute, $scope.minutes)) {
              $scope.minutes.push(minute);
            }
          }
        });

        angular.quickSort($scope.minutes, false);
      }
    };

    exports.delMinutes = function(begin_or_minutes, until, step) {
      step = step || 1;

      var minutes = [];
      if (arguments.length > 1) {
        for (var i = parseInt(begin_or_minutes), j = parseInt(until); i <= j; i += step) {
          minutes.push(i);
        }

        exports.delMinutes(minutes);
      }
      else {
        minutes = angular.isArray(begin_or_minutes) ? begin_or_minutes : [begin_or_minutes];

        var index, i, minutes;
        for (i = 0, minutes = $scope.minutes; i < minutes.length; i ++) {
          var index = angular.inArray(minutes[i], $scope.minutes);
          if (-1 !== index) $scope.minutes.splice(index, 1);
          i --;
        }  
      }
    };

    exports.cleanMinutes = function() {
      $scope.minutes.splice(0, $scope.minutes.length);
    };

    exports.setMinutes = function() {
      exports.cleanMinutes();
      exports.addMinutes.apply(exports, arguments);
    };

    exports.addSeconds = function(begin_or_seconds, until, step) {
      step = step || 1;

      var seconds = [];
      if (arguments.length > 1) {
        for (var i = parseInt(begin_or_seconds), j = parseInt(until); i <= j; i += step) {
          seconds.push(i);
        }

        exports.addSeconds(seconds);
      }
      else {
        seconds = angular.isArray(begin_or_seconds) ? begin_or_seconds : [begin_or_seconds];
        angular.forEach(seconds, function(second) {
          second = parseInt(second);
          if (0 <= second && second < 60) {
            if (-1 === angular.inArray(second, $scope.seconds)) {
              $scope.seconds.push(second);
            }
          }
        });

        angular.quickSort($scope.seconds, false);
      }
    };

    exports.delSeconds = function(begin_or_seconds, until, step) {
      step = step || 1;

      var seconds = [];
      if (arguments.length > 1) {
        for (var i = parseInt(begin_or_seconds), j = parseInt(until); i <= j; i += step) {
          seconds.push(i);
        }

        exports.delSeconds(seconds);
      }
      else {
        seconds = angular.isArray(begin_or_seconds) ? begin_or_seconds : [begin_or_seconds];

        var index, i, seconds;
        for (i = 0, seconds = $scope.seconds; i < seconds.length; i ++) {
          var index = angular.inArray(seconds[i], $scope.seconds);
          if (-1 !== index) $scope.seconds.splice(index, 1);
          i --;
        }  
      }
    };

    exports.cleanSeconds = function() {
      $scope.seconds.splice(0, $scope.seconds.length);
    }

    exports.setSeconds = function(begin_or_seconds, until, step) {
      exports.cleanSeconds();
      exports.addSeconds.apply(exports, arguments);
    };

    exports.addDvisions = function(dvisions) {
      dvisions = angular.isArray(dvisions) ? dvisions : [dvisions];
      angular.forEach(dvisions, function(dvision) {
        if (-1 !== angular.inArray(dvision, constDvisions) && -1 === angular.inArray(dvision, $scope.dvisions)) {
          $scope.dvisions.push(dvision);
        }
      });

      angular.quickSort($scope.dvisions, false);
    };

    exports.delDvisions = function(dvisions) {
      dvisions = angular.isArray(dvisions) ? dvisions : [dvisions];

      var index, i, dvisions;
      for (i = 0, dvisions = $scope.dvisions; i < dvisions.length; i ++) {
        var index = angular.inArray(dvisions[i], $scope.dvisions);
        if (-1 !== index) $scope.dvisions.splice(index, 1);
        i --;
      }
    };

    exports.cleanDvisions = function() {
      $scope.dvisions.splice(0, $scope.dvisions.length);
    };

    exports.setDvision = function() {
      exports.cleanDvisions();
      exports.addDvisions.apply(exports, arguments);
    };

    exports.selectDate = function(date) {
      if (date instanceof Date) date = parseInt(date.getTime()/(1000*60*60*24));
      else if (angular.isNumeric(date)) return;      
      $scope.selects[0] = Number(date);
    };

    exports.selectHour = function(hour) {
      if (! angular.isNumeric(hour)) return;
      $scope.selects[1] = Number(hour);
    };

    exports.selectMinute = function(minute) {
      if (! angular.isNumeric(minute)) return;
      $scope.selects[2] = Number(minute);
    };
 
    exports.selectSecond = function(second) {
      if (! angular.isNumeric(second)) return;
      $scope.selects[3] = Number(second);
    };

    exports.selectDvision = function(dvision) {
      var index = angular.inArray(dvision, constDvisions);
      if (-1 === index) return;

      $scope.selects[4] = dvision;
      var hour = Number($scope.hours[dvision][1] || $scope.hours[dvision][0]);
      hour = index == 0 ? hour : hour == 12 ? hour : hour + 12;

      exports.selectHour(hour);
    };

    exports.select = function(date, hour, minute, second, dvision) {
      exports.selectDate(date);
      exports.selectHour(hour);
      exports.selectMinute(minute);
      exports.selectSecond(second);
      exports.selectDvision(dvision);
    };

    exports.getTime = function() {
      var selects = $scope.selects,
      date = new Date(),
      time = selects[0]*1000*60*60*24,
      hour = selects[4] === 'AM' ? selects[1] : selects[1] +12,
      minutes = selects[2],
      seconds = selects[3];

      angular.isNumber(time) && date.setTime(time);
      angular.isNumber(hour) && date.setHours(hour);
      angular.isNumber(minutes) && date.setMinutes(minutes);
      angular.isNumber(seconds) && date.setSeconds(seconds);

      return date.getTime();
    };

    $scope.selectDate = function(date) { exports.selectDate(date); };
    $scope.selectHour = function(hour) { exports.selectHour(hour); };
    $scope.selectMinute = function(minute) { exports.selectMinute(minute); };
    $scope.selectSecond = function(second) { exports.selectSecond(second); };
    $scope.selectDvision = function(dvision) { exports.selectDvision(dvision); };

    var begin = new Date(), end = new Date();
    end.setDate(begin.getDate() + 2);

    exports.addDates(begin, end);
    exports.addHours(0, 24);
    exports.addMinutes(0, 60, 5);
    exports.addDvisions(constDvisions);
    exports.select(begin, 1, 30, '', 'AM');

    $scope.$watch(exports.getTime, function(value) {
      exports.ngModel.$setViewValue(new Date(value));
    });
  }
])

.directive('timepicker', [
  function() {
    return {
      restrict: 'EA',
      transclude: true,
      replace: true,
      controller: 'TimepickerController',
      templateUrl: 'template/timepicker/timepicker.html',
      require: ['timepicker', '?^ngModel'],
      scope: {},
      link: function($scope, $element, $attrs, ctrls) {
        var timepickerCtrl = ctrls[0],
        ngModel = ctrls[1];

        timepickerCtrl.ngModel = ngModel;

        var dates = ($attrs.dates || '').replace(/([\[\]\s])+/g, '').split(','),
        hours = ($attrs.hours || '').replace(/[\[\]\s]+/g, '').split(','),
        minutes = ($attrs.minutes || '').replace(/[\[\]\s]+/g, '').split(','),
        seconds = ($attrs.seconds || '').replace(/[\[\]\s]+/g, '').split(',');

        if (angular.isArray(dates) && dates.length > 0) {
          if (dates.length > 2) {
            angular.forEach(dates, function(date) {
              timepickerCtrl.addDates(new Date(date));
            });
          }
          else timepickerCtrl.addDates(new Date(dates[0]), new Date(dates[1]));
        }

        if (angular.isArray(hours) && hours.length > 0) {
          if (hours.length > 2) timepickerCtrl.addHours.apply(timepickerCtrl, hours);
          else timepickerCtrl.addHours(hours[0], hours[1]);
        }

        if (angular.isArray(minutes) && minutes.length > 0) {
          if (minutes.length > 2) timepickerCtrl.addMinutes.apply(timepickerCtrl, minutes);
          else timepickerCtrl.addMinutes(minutes[0], minutes[1]);
        }

        if (angular.isArray(seconds) && seconds.length > 0) {
          if (seconds.length > 2) timepickerCtrl.addseconds.apply(timepickerCtrl, seconds);
          else timepickerCtrl.addSeconds(seconds[0], seconds[1]);
        }
      }
    };
  }
]);

angular.module('ui.warpperSlider', [])

.directive('wrapperSlider', [
  '$transition',
  function($transition) {'use strict';
    return {
      restrict: 'EA',
      require: '?ngModel',
      scope: {},
      link: function($scope, $element, $attrs, ctrl) {
        var lastPercentage = 0, num = $attrs.number,
        isWrap = $element[0].offsetWidth > window.outerWidth,
        step = isWrap ? -100 : 100/num,
        minX = isWrap ? (num -1)*step : 0,
        maxX = isWrap ? 0 : (num -1)*step,
        startX, endX, deltaX, point, isDrag, part,
        percentage, currentTransition;

        function doTransition(change) {
          var newTransition = $transition($element, change);
          if (currentTransition) currentTransition.cancel();

          currentTransition = newTransition;
          newTransition.then(newTransitionDone, newTransitionDone);
          return newTransition;

          function newTransitionDone() {
            if (currentTransition === newTransition) {
              currentTransition = undefined;
            }
          }
        }

        function moveTo(position) {
          $element.addClass('move');
          position = Math.min(Math.max(position, minX), maxX);
          doTransition({ left: position + '%' }).
          then(function() { $element.removeClass('move'); });
        }

        function moveToPart(part, isDrag) {
          if (part < 0) return;

          if (isDrag || Math.abs(percentage)%Math.abs(step) > Math.abs(step)/2) {
            part = part + (startX > endX ? 1 : 0);
            percentage = step*part;
          }
          else percentage = step*part;
          
          moveTo(percentage);
          ctrl.$setViewValue(part);
          lastPercentage = percentage;
        }

        function touchstart(event) {
          point = event.changedTouches ? event.changedTouches[0] : event;
          startX = point.pageX;
          angular.element(window).on('touchmove mousemove', touchmove);
        }

        function touchmove(event) {
          isDrag = true;

          point = event.changedTouches ? event.changedTouches[0] : event;
          deltaX = point.pageX - startX;

          if (isWrap) percentage = deltaX/window.outerWidth*100;
          else percentage = -(deltaX/window.outerWidth*100/num);

          percentage += lastPercentage;
          percentage = Math.max(Math.min(percentage, maxX), minX);
          $element.css('left', percentage + '%');
        }

        function touchend(event) {
          if (!isDrag) return;
          point = event.changedTouches ? event.changedTouches[0] : event;
          endX = point.pageX;

          moveToPart(Math.floor(percentage/step), isWrap ? true : false);
          angular.element(window).off('touchmove', touchmove);
        }

        // angular.element(window).
        // on('touchstart', touchstart).
        // on('touchend', touchend);

        $scope.$watch(function() { return ctrl.$modelValue; }, function(value) {
          moveToPart(value || 0);
        });
      }
    };
  }
]);

angular.module('ui.zeroclipboard', [])

.directive('zeroclipboard', [
  function() {
    return {
      restrict: 'EA',
      replace: true,
      link: function($scope, $element, $attrs) {
        
      }
    };
  }
]);angular.module('templates-dist', ['tpls/ngScroll/ngScroll.html']);

angular.module("tpls/ngScroll/ngScroll.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("tpls/ngScroll/ngScroll.html",
    "<div ng-class=\"{ &quot;open&quot;: showRails }\" class=\"ng-scroll\">\n" +
    "  <div ng-show=\"isVertical\" ng-class=\"{ &quot;scroll-left&quot;: isFixedLeft }\" class=\"scroll-rails\">\n" +
    "    <div ng-scroll-slider=\"ng-scroll-slider\" vertical=\"vertical\" class=\"scroll-slider\"></div>\n" +
    "  </div>\n" +
    "  <div ng-show=\"isHorizontal\" ng-class=\"{ &quot;scroll-bottom&quot;: isFixedTop }\" class=\"scroll-rails scroll-horizontal\">\n" +
    "    <div ng-scroll-slider=\"ng-scroll-slider\" horizontal=\"horizontal\" class=\"scroll-slider\"></div>\n" +
    "  </div>\n" +
    "  <div ng-scroll-content=\"ng-scroll-content\" ng-transclude=\"ng-transclude\" class=\"scroll-inner\"></div>\n" +
    "</div>");
}]);
;angular.module('templates-dist', ['tpls/selecter/selecter.html']);

angular.module("tpls/selecter/selecter.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("tpls/selecter/selecter.html",
    "<selectpicker>\n" +
    "  <div dropdown-menu=\"dropdown-menu\" class=\"selectpicker\"><a dropdown-menu-toggle=\"dropdown-menu-toggle\" class=\"dropdown-toggle\">{{ selected.text || selected.value || '' }}</a>\n" +
    "    <div dropdown-menu-dialog=\"dropdown-menu-dialog\" class=\"dropdown-menu\">\n" +
    "      <div class=\"filter-bar\"><i class=\"fa fa-search\"></i>\n" +
    "        <input dropdown-menu-filter=\"dropdown-menu-filter\" type=\"search\" placeholder=\"Search...\" class=\"form-control\"/>\n" +
    "      </div>\n" +
    "      <ul dropdown-menu-list=\"dropdown-menu-list\" class=\"menu-list\">\n" +
    "        <li ng-repeat=\"item in options\"><a ng-click=\"select(item.value)\" title=\"item.text\">{{ item.text }}</a></li>\n" +
    "      </ul>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</selectpicker>");
}]);
