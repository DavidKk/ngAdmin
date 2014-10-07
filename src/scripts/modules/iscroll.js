

angular.module('ui.iscroll', [
  'ui.helper', 'ui.style'
])

.controller('iscrollCtrl', [
  '$scope', '$timeout',
  function($scope, $timeout) {'use strict';
    var exports = this,
    timeoutId;

    $scope.showRails = false;

    exports.showRails = function(digest) {
      timeoutId && $timeout.cancel(timeoutId);
      $scope.showRails = true;
      digest !== false && $scope.$digest();

      return timeoutId = $timeout(function() {
        $scope.showRails = false;
      }, 2000);
    };
  }
])

.directive('iscroll', [
  '$q', '$device', 'easing', '$prefixStyle', '$animateFrame',
  function($q, $device, easing, $prefixStyle, $animateFrame) {
    return {
      restrict: 'EA',
      transclude: true,
      replace: true,
      templateUrl: 'tpls/iscroll/iscroll.html',
      controller: 'iscrollCtrl',
      scope: {},
      link: function($scope, $element, $attrs, ctrl) {'use strict';
        $scope.isHorizontal = $attrs.$attr.hasOwnProperty('horizontal') ? !!$attrs.$attr.horizontal : false;
        $scope.isVertical = $attrs.$attr.hasOwnProperty('vertical') ? !!$attrs.$attr.vertical : true;
        $scope.isFixedLeft = $attrs.$attr.hasOwnProperty('fixedLeft') ? !!$attrs.$attr.fixedLeft : false;
        $scope.isFixedTop = $attrs.$attr.hasOwnProperty('fixedTop') ? !!$attrs.$attr.fixedTop : false;

        var $scroller = ctrl.getScroller(),
            $horzSlider = ctrl.getHorizontalSlider(),
            $vertSlider = ctrl.getVerticalSlider(),
            events = {
              start: 'touchstart pointerdown MSPointerDown',
              move: 'touchmove pointermove MSPointerMove',
              end: 'touchend pointerup MSPointerUp',
              cancel: 'touchcancel pointercancel MSPointerCancel'
            },
            ease = easing,
            easeType = $attrs.$attr.hasOwnProperty('ease') || 'bounce',
            _transition = $prefixStyle('transition'),
            _transitionTimingFunction = $prefixStyle('transitionTimingFunction'),
            _transitionDuration = $prefixStyle('transitionDuration'),
            _transform = $prefixStyle('transform'),
            _size, screenW, screenH, maxScrollX, maxScrollY, curX, curY,

            // for pc wheel.
            railsXP = 0, railsYP = 0,
            railsWP, railsHP;

        $scope.$watch(function() {
          var size = ctrl.getScrollerSize(),
              element = $element[0];

          _size = {
            scrollerW: size.width,
            scrollerH: size.height,
            viewW: element.clientWidth,
            viewHeight: element.clientHeight
          };

          return JSON.stringify(_size);
        },
        function() {
          var element = $element[0],
              scrollerW = _size.scrollerW,
              scrollerH = _size.scrollerH,
              radioW, radioH;

          screenW = element.clientWidth;
          screenH = element.clientHeight;
          radioW = screenW/scrollerW;
          radioH = screenH/scrollerH;

          maxScrollX = -(scrollerW - screenW);
          maxScrollY = -(scrollerH - screenH);

          railsWP = angular.isNumeric(radioW) ? radioW : 1;
          railsWP = Math.max(Math.min(railsWP, 1), 0);
          $horzSlider.css('width', railsWP * 100 + '%');

          railsHP = angular.isNumeric(radioH) ? radioH : 1;
          railsHP = Math.max(Math.min(railsHP, 1), 0);
          $vertSlider.css('height', railsHP * 100 + '%');

          ctrl.showRails(false);
        });
    
        function transition(trans) {
          $scroller.css(_transition, trans);
        }

        function transitionTimingFunction(easing) {
          $scroller.css(_transitionTimingFunction, easing);
        }

        function transitionTime(time) {
          time = time || 0;
          $scroller.css(_transitionDuration, time + 'ms');
          !time && $device.isBadAndroid && $scroller.css(_transitionDuration, '0.001s');
        } 

        function translate(destX, destY) {
          $scroller.css(_transform, 'translate(' + destX + 'px,' + destY + 'px)');
          curX = destX;
          curY = destY;
        }

        // get scroller position which is scrolling.
        function getComputedPosition() {
          var matrix = window.getComputedStyle($scroller[0], null),
              x, y;

          matrix = matrix[_transform];
          if (matrix && matrix !== 'none') {
            matrix = matrix.split(')')[0].split(', ');
            x = +(matrix[12] || matrix[4]);
            y = +(matrix[13] || matrix[5]);
            return { x: x, y: y };
          }

          return {};
        }

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

        var animationPromise = {};
        function animation(destX, destY, duration, easingFn, promise) {
          easingFn = easingFn || ease[easeType].fn;
          transition('');

          var startX = curX,
              startY = curY,
              startTime = Date.now(),
              destTime = startTime + duration,
              isAnimating = true;

          !(function step() {
            var now = Date.now(),
                destinationX, destinationY, easing;

            if (now >= destTime) {
              isAnimating = false;
              translate(destX, destY);

              destX = Math.min(Math.max(destX, maxScrollX), 0);
              destY = Math.min(Math.max(destY, maxScrollY), 0);

              destX !== curX || destY !== curY && animation(destX, destY, ease.bounce.time, easingFn, promise);
            }
            else {
              now = (now - startTime)/duration;
              easing = easingFn(now);
              destinationX = (destX - startX) * easing + startX;
              destinationY = (destY - startY) * easing + startY;
              translate(destinationX, destinationY);
              isAnimating && $animateFrame.rAF(step);
            }
          })();

          promise.stop = function() {
            isAnimating = undefined;
          };
        }

        function scrollTo(destX, destY, duration, easing, promise) {
          easing = easing || ease[easeType];
          duration = easing.name === 'bounce' ? ease.bounce.time : duration;

          if (!duration || easing.style) {
            transitionTimingFunction(easing.style);
            transitionTime(duration);
            translate(destX, destY);

            destX = Math.min(Math.max(destX, maxScrollX), 0);
            destY = Math.min(Math.max(destY, maxScrollY), 0);

            if (destX !== curX || destY !== curY) {
              setTimeout(function() {
                destX = Math.min(Math.max(destX, maxScrollX), 0);
                destY = Math.min(Math.max(destY, maxScrollY), 0);
                scrollTo(destX, destY, duration, undefined, promise);
              }, duration);
            }
          }
          else if (easing.fn) {
            animation(destX, destY, duration, easing.fn, promise);
          }
        }

        // mobile touch
        $element
        .on(events.start, function(event) {
          var touch = event.touches ? event.touches[0] : event,
              startX = touch.pageX,
              startY = touch.pageY,
              point = getComputedPosition(event),
              beginX = parseInt(point.x) || 0,
              beginY = parseInt(point.y) || 0,
              startTime = Date.now();

          animationPromise.stop && animationPromise.stop();
          transition('');
          translate(beginX, beginY);

          var move = function(event) {
            var touch = event.touches ? event.touches[0] : event,
                size = ctrl.getScrollerSize(),
                endX = touch.pageX,
                endY = touch.pageY,
                deltaX = endX - startX,
                deltaY = endY - startY;

            translate($scope.isHorizontal ? curX + deltaX : 0, $scope.isVertical ? curY + deltaY : 0);
            startX = endX;
            startY = endY;
          };

          var end = function(event) {
            var duration = Date.now() - startTime,
                absDeltaX = Math.abs(curX - beginX),
                absDeltaY = Math.abs(curY - beginY),
                destX = curX,
                destY = curY,
                momentumX, momentumY;

            destX = Math.min(Math.max(destX, maxScrollX), 0);
            destY = Math.min(Math.max(destY, maxScrollY), 0);
            if (destX === curX && destY === curY) {
              if (duration < 300) {
                momentumX = $scope.isHorizontal ? momentum(curX, beginX, duration, maxScrollX, screenW) : { destination: curX, duration: 0 };
                momentumY = $scope.isVertical ? momentum(curY, beginY, duration, maxScrollY, screenH) : { destination: curY, duration: 0 };
                destX = momentumX.destination;
                destY = momentumY.destination;
                duration = Math.max(momentumX.duration, momentumY.duration);
              }

              scrollTo(destX, destY, duration, ease.quadratic, animationPromise);
            }
            else {
              // at the top/bottom of scroller
              scrollTo(destX, destY, duration, undefined, animationPromise);
            }

            angular.element(window)
            .off(events.move, move)
            .off(events.end + ' ' + events.cancel, end);
          };

          angular.element(window)
          .on(events.move, move)
          .on(events.end + ' ' + events.cancel, end);
        });

        // pc mouse wheel, not drag
        $element
        .on('mouseenter', ctrl.showRails)
        .on('mousewheel', function(event) {
          ctrl.showRails();

          var scrollerW = _size.scrollerW,
              scrollerH = _size.scrollerH,
              point = getComputedPosition(event),
              beginX = parseInt(point.x) || 0,
              beginY = parseInt(point.y) || 0;

          animationPromise.stop && animationPromise.stop();
          transition('');
          translate(beginX, beginY);

          if ($scope.isHorizontal && event.wheelDeltaX !== 0) {
            var maxRailsWP = 1 - railsWP;

            railsXP -= event.wheelDeltaX/scrollerW;
            railsXP = Math.max(Math.min(railsXP, maxRailsWP), 0);
            $horzSlider.css(_transform, 'translate(' + railsXP * screenW + 'px, 0)');
          }

          if ($scope.isVertical && event.wheelDeltaY !== 0) {
            var maxRailsHP = 1 - railsHP;

            railsYP -= event.wheelDeltaY/scrollerH;
            railsYP = Math.max(Math.min(railsYP, maxRailsHP), 0);
            $vertSlider.css(_transform, 'translate(0,' + railsYP * screenH + 'px)');
          }

          translate(-railsXP * scrollerW, -railsYP * scrollerH);
        });
      }
    };
  }
])

.directive('iscrollWrapper', [
  function() {
    return {
      restrict: 'A',
      require: '?^iscroll',
      link: function($scope, $element, $attrs, ctrl) {'use strict';
        ctrl.getScrollerSize = function() {
          var el = $element[0];
          return {
            width: el.clientWidth,
            height: el.clientHeight
          };
        };

        ctrl.getScroller = function() {
          return $element;
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

        if (isHorizontal) method = 'getHorizontalSlider';
        else if (isVertical) method = 'getVerticalSlider';

        if (method) {
          ctrl[method] = function() {
            return $element;
          };
        }

        // TODO: drag scroll
        $element
        .on('mousedown', function(event) {
          var point = getComputedPosition(event),
              beginX = parseInt(point.x) || 0,
              beginY = parseInt(point.y) || 0;

          console.log(beginY)

          var move = function(event) {
            endX = event.pageX;
            endY = event.pageY;
            deltaX = endX - startX;
            deltaY = endY - startY;
          };

          var end = function(event) {


            $element
            .off('mousemove', move)
            .off('mouseup', end);
          };

          $element
          .on('mousemove', move)
          .on('mouseup', end);
        });
      }
    };
  }
])