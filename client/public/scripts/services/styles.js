

angular.module('services.styles', [])

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

/**
 * $prefixStyle 获取浏览器 CSS3 属性的前缀
 * @param  {String} 标准 CSS3 属性名称
 * @return {String} 浏览器的 CSS3 属性名称
 */
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

/**
 * $animateFrame 动画，兼容各个浏览器
 * @param  {Function} 每一帧的动作方法
 */
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
        else deferred.resolve();
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

/**
 * getComputedPosition 获取对象当前 transform 位置，主要用于移动中，例如缓减速过程要获取位置
 * @param  {Object}
 * @return {Object} 返回 {x, y};
 */
.factory('$getComputedPosition', [
  '$prefixStyle',
  function($prefixStyle) {'use strict';
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
    var endEventName = $transition[options.animation ? 'animationEndEventName' : 'transitionEndEventName'];

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
  }

  // Work out the name of the transitionEnd event
  var transElement = document.createElement('trans');
  var transitionEndEventNames = {
    'WebkitTransition': 'webkitTransitionEnd',
    'MozTransition': 'transitionend',
    'OTransition': 'oTransitionEnd',
    'transition': 'transitionend'
  }

  var animationEndEventNames = {
    'WebkitTransition': 'webkitAnimationEnd',
    'MozTransition': 'animationend',
    'OTransition': 'oAnimationEnd',
    'transition': 'animationend'
  }

  function findEndEventName(endEventNames) {
    for (var name in endEventNames){
      if (transElement.style[name] !== undefined) {
        return endEventNames[name];
      }
    }
  }

  $transition.transitionEndEventName = findEndEventName(transitionEndEventNames)
  $transition.animationEndEventName = findEndEventName(animationEndEventNames)
  return $transition
}])