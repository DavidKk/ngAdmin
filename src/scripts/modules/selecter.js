

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
])