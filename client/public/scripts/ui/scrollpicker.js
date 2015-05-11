

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
])