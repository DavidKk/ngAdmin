

angular.module('ui.iscroll', [
  'ui.helper', 'ui.style'
])

.controller('iscrollCtrl', [
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

.directive('iscroll', [
  '$q',
  '$device', 'easing', '$prefixStyle', '$animateFrame',
  function($q, $device, ease, $prefixStyle, $animateFrame) {
    return {
      restrict: 'EA',
      transclude: true,
      replace: true,
      templateUrl: 'tpls/iscroll/iscroll.html',
      controller: 'iscrollCtrl',
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

        // get scroller position which is scrolling.
        function getComputedPosition($elem) {
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
              point = getComputedPosition($content),
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
                  scrollTo($content, curX, curY, destX, destY, ease[$scope.easeType].time || duration, ease[$scope.easeType], ctrl.hideRails);
                });

                $scope.isHorizontal && scrollTo($horzSlider, -destX * $scope.railsWP, 0, -Math.min(Math.max(destX, _size.maxScrollX), 0) * $scope.railsWP, 0, duration, ease.quadratic);
                $scope.isVertical && scrollTo($vertSlider, 0, -destY * $scope.railsHP, 0, -Math.min(Math.max(destY, _size.maxScrollY), 0) * $scope.railsHP, duration, ease.quadratic);
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
              point = getComputedPosition($content),
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

.directive('iscrollContent', [
  function() {
    return {
      restrict: 'A',
      require: '?^iscroll',
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

.directive('iscrollSlider', [
  function() {
    return {
      restrict: 'A',
      require: '?^iscroll',
      link: function($scope, $element, $attrs, ctrl) {'use strict';
        var isHorizontal = $attrs.$attr.hasOwnProperty('horizontal'),
            isVertical = $attrs.$attr.hasOwnProperty('vertical'),
            method;

        if (isHorizontal) method = 'getHorzSlider';
        else if (isVertical) method = 'getVertSlider';
        else return false;

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

        // TODO: drag scroll
      }
    };
  }
])