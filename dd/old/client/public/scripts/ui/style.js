

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
])