

angular.module('ui.scroll-bar', [
  'ngHelper'
])

.controller('ScrollBarController', [
  '$scope', '$timeout',
  function($scope, $timeout) {
    var exports = this,
    timer = {};

    $scope.wh = 0;    // screen height
    $scope.ww = 0;    // screen width
    $scope.ch = 0;    // content height
    $scope.cw = 0;    // content width
    $scope.shp = 0;   // scroller height per
    $scope.swp = 0;   // scroller width per
    $scope.syp = 0;   // scroller top per
    $scope.sxp = 0;   // scroller left per

    $scope.$watch('wh/ch', function(value) {
      $scope.shp = angular.isNumeric(value) ? value : 1;
      $scope.shp = $scope.shp > 1 ? 1 : $scope.shp < 0 ? 0 : $scope.shp;
    });

    $scope.$watch('ww/cw', function(value) {
      $scope.swp = angular.isNumeric(value) ? value : 1;
      $scope.swp = $scope.swp > 1 ? 1 : $scope.swp < 0 ? 0 : $scope.swp;
    });

    exports.show = function() {
      timer.cancel && timer.cancel();

      $scope.show = true;
      $scope.$digest();

      timer = $timeout(function() {
        $scope.show = false;
      }, 2000);
    };
  }
])

.directive('scrollBar', [
  function() {
    return {
      restrict: 'EA',
      transclude: true,
      replace: true,
      templateUrl: 'templates/scroll-bar/scroll-bar.html',
      controller: 'ScrollBarController',
      scope: {
        wh: '=?',
        ww: '=?',
        ch: '=?',
        cw: '=?',
        syp: '=?',
        sxp: '=?'
      },
      link: function($scope, $element, $attrs, ctrl, transclude) {'use strict';
        $scope.isVertical = $attrs.$attr.hasOwnProperty('vertical') ? !!$attrs.$attr.vertical : true;
        $scope.isHorizontal = $attrs.$attr.hasOwnProperty('horizontal') ? !!$attrs.$attr.horizontal : false;

        var elbody = (function() {
          var i = 0,
          s = $element.children(),
          l = s.length,
          $el,
          attrTransclude;

          for (; i < l; i ++) {
            $el = angular.element(s[i]);
            attrTransclude = $el.attr('ng-transclude');

            if (angular.isDefined(attrTransclude)) {
              return s[i];
            }
          }
        })();

        $scope.syp = 0;
        $scope.sxp = 0;
        $scope.show = false;

        $scope.$watch(function() { return $element[0].clientHeight + $element[0].clientWidth; }, function() {
          $scope.wh = $element[0].clientHeight;
          $scope.ww = $element[0].clientWidth;
        });

        if ($scope.isVertical) {
          $scope.$watch(function() { return elbody.clientHeight; }, function(height) {
            $scope.ch = height;
          });
        }

        if ($scope.isHorizontal) {
          $scope.$watch(function() { return elbody.clientWidth; }, function(width) {
            $scope.cw = width;
          });
        }

        $element.on('mouseenter', function() {
          ctrl.show();
        });

        $element.on('wheel', function(event) {
          ctrl.show();

          $scope.$apply(function() {
            if (event.wheelDeltaY !== 0) {
              var maxH = 1 - $scope.shp;
              $scope.syp += -event.wheelDeltaY/elbody.clientHeight;
              $scope.syp = $scope.syp < 0 ? 0 : $scope.syp > maxH ? maxH : $scope.syp;
              angular.element(elbody).css('top', -$scope.syp * elbody.clientHeight + 'px');
            }

            if (event.wheelDeltaX !== 0) {
              var maxW = 1 - $scope.shp;
              $scope.sxp += -event.wheelDeltaX/elbody.clientHeight;
              $scope.sxp = $scope.sxp < 0 ? 0 : $scope.sxp > maxW ? maxW : $scope.sxp;
              angular.element(elbody).css('left', -$scope.sw * elbody.clientWidth + 'px');
            }
          });
        });
      }
    };
  }
])