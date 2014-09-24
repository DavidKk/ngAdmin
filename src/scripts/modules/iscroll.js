

angular.module('ui.iscroll', ['ui.helper'])

.controller('iscrollCtrl', [
  '$scope', '$timeout',
  function($scope, $timeout) {'use strict';
    var exports = this,
    timeoutId;

    $scope.screenW   = 0;      // wrapper height
    $scope.screenH   = 0;      // wrapper width
    $scope.railsWP   = 0;      // rails width per
    $scope.railsHP   = 0;      // rails height per
    $scope.railsXP   = 0;      // rails left per
    $scope.railsYP   = 0;      // rails top per
    $scope.showRails = false;  // show rails

    exports.showRails = function() {
      timeoutId && $timeout.cancel(timeoutId);
      $scope.showRails = true;
      $scope.$digest();

      return timeoutId = $timeout(function() {
        $scope.showRails = false;
      }, 2000);
    };
  }
])

.directive('iscroll', [
  '$css3Style',
  function($css3Style) {
    return {
      restrict: 'EA',
      transclude: true,
      replace: true,
      templateUrl: 'tpls/iscroll/iscroll.html',
      controller: 'iscrollCtrl',
      scope: {
        screenW:  '=?',
        screenH:  '=?',
        railsX:   '=?',
        railsY:   '=?',
        railsXP:  '=?',
        railsYP:  '=?'
      },
      link: function($scope, $element, $attrs, ctrl) {'use strict';
        $scope.isVertical = $attrs.$attr.hasOwnProperty('vertical') ? !!$attrs.$attr.vertical : true;
        $scope.isHorizontal = $attrs.$attr.hasOwnProperty('horizontal') ? !!$attrs.$attr.horizontal : false;
        $scope.isFixedLeft = $attrs.$attr.hasOwnProperty('fixedLeft') ? !!$attrs.$attr.fixedLeft : false;
        $scope.isFixedTop = $attrs.$attr.hasOwnProperty('fixedTop') ? !!$attrs.$attr.fixedTop : false;

        $scope.$watch(function() {
          var size = ctrl.getContentSize(),
              el = $element[0];
          return JSON.stringify(angular.extend(size, { vwidth: el.clientWidth, vheight: el.clientHeight }));
        },
        function() {
          var el = $element[0];
          $scope.screenW = el.clientWidth;
          $scope.screenH = el.clientHeight;

          var size = ctrl.getContentSize(),
              radioW = $scope.screenW/size.width,
              radioH = $scope.screenH/size.height;

          $scope.railsWP = angular.isNumeric(radioW) ? radioW : 1;
          $scope.railsWP = $scope.railsWP > 1 ? 1 : $scope.railsWP < 0 ? 0 : $scope.railsWP;
          
          $scope.railsHP = angular.isNumeric(radioH) ? radioH : 1;
          $scope.railsHP = $scope.railsHP > 1 ? 1 : $scope.railsHP < 0 ? 0 : $scope.railsHP;
        });

        // pc mouse wheel
        $element
        .on('mouseenter', function() {
          ctrl.showRails();
        })
        .on('mousewheel', function(event) {
          ctrl.showRails();
          var size = ctrl.getContentSize(),
              $el = ctrl.getContent();

          if ($scope.isHorizontal && event.wheelDeltaX !== 0) {
            var maxRailsWP = 1 - $scope.railsWP;
            $scope.railsXP += -event.wheelDeltaX/size.width;
            $scope.railsXP = $scope.railsXP < 0 ? 0 : $scope.railsXP > maxRailsWP ? maxRailsWP : $scope.railsXP;
          }

          if ($scope.isVertical && event.wheelDeltaY !== 0) {
            var maxRailsHP = 1 - $scope.railsHP;
            $scope.railsYP += -event.wheelDeltaY/size.height;
            $scope.railsYP = $scope.railsYP < 0 ? 0 : $scope.railsYP > maxRailsHP ? maxRailsHP : $scope.railsYP;
          }
          
          $el.css($css3Style.prefixStyle('transform'), 'translate(' + (-$scope.railsXP * size.width) + 'px,' + (-$scope.railsYP * size.height) + 'px)');
        });

        var startY, endY, deltaY, absDeltaY, speedY, destinationY,
            startX, endX, deltaX, absDeltaX, speedX, destinationX,
            startTime, deceleration, duration;

        $element.on('touchstart', function(event) {
          var touch = event.touches ? event.touches[0] : event,
          $el = ctrl.getContent();

          startX = touch.pageX;
          startY = touch.pageY;
          startTime = Date.now();

          var move = function(event) {
            ctrl.showRails();

            var touch = event.touches ? event.touches[0] : event;
            endX = touch.pageX;
            endY = touch.pageY;
            deltaX = endX - startX;
            deltaY = endY - startY;

            var size = ctrl.getContentSize(),
                maxRailsWP = 1 - $scope.railsWP,
                maxRailsHP = 1 - $scope.railsHP;

            if ($scope.isHorizontal) {
              $scope.railsXP += -deltaY/size.width;
              $scope.railsXP = $scope.railsXP < 0 ? 0 : $scope.railsXP > maxRailsWP ? maxRailsWP : $scope.railsXP;
            }

            if ($scope.isVertical) {
              $scope.railsYP += -deltaY/size.height;
              $scope.railsYP = $scope.railsYP < 0 ? 0 : $scope.railsYP > maxRailsHP ? maxRailsHP : $scope.railsYP;
            }

            $el.css($css3Style.prefixStyle('transform'), 'translate(' + (-$scope.railsXP * size.height) + ',' + (-$scope.railsYP * size.height) + 'px)');
          };

          var end = function(event) {
            var size = ctrl.getContentSize(),
                absDeltaX = Math.abs(deltaX),
                absDeltaY = Math.abs(deltaY),
                deltaTime = Date.now() - startTime;

            deceleration = 0.0006;
            speedX = absDeltaX / deltaTime;
            speedY = absDeltaY / deltaTime;
            destinationX = (endX + (speedX * speedX) / (2 * deceleration)) * (deltaX < 0 ? -1 : 1);
            destinationY = (endY + (speedY * speedY) / (2 * deceleration)) * (deltaY < 0 ? -1 : 1);
            duration = (absDeltaX > absDeltaY ? speedX : speedY) / deceleration;

            destinationX = Math.min(Math.max(destinationX, -(size.width - $scope.screenW)), 0);
            destinationY = Math.min(Math.max(destinationY, -(size.height - $scope.screenH)), 0);
            $el.css($css3Style.prefixStyle('transition'), 'cubic-bezier(.1,.57,.1,1) ' + duration + 'ms')
            .css($css3Style.prefixStyle('transform'), 'translate(' + destinationX + 'px,' + destinationY + 'px)');

            angular.element(window)
            .off('touchmove', move)
            .off('touchend', end);
          };

          angular.element(window)
          .on('touchmove', move)
          .on('touchend', end);
        });

        // TODO:Drag Event
      }
    };
  }
])

.directive('iscrollWrapper', [
  function() {
    return {
      restrict: 'EA',
      require: '?^iscroll',
      link: function($scope, $element, $attrs, ctrl) {'use strict';

        ctrl.getContentSize = function() {
          var el = $element[0];
          return {
            width: el.clientWidth,
            height: el.clientHeight
          };
        };

        ctrl.getContent = function() {
          return $element;
        };
      }
    };
  }
])