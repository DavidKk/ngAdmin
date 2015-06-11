angular.module('ui.checkbox', ['templates/checkbox/checkbox.html'])

.controller('CheckboxController', [
  '$scope',
  function($scope) {'use strict';
    $scope.checked = false;
  }
])

.directive('checkbox', [
  '$rootScope',
  function($rootScope) {
    return {
      restrict: 'EA',
      transclude: true,
      replace: true,
      controller: 'CheckboxController',
      templateUrl: 'templates/checkbox/checkbox.html',
      require: ['^checkbox', '^?ngModel'],
      scope: {
        model: '=?ngModel',
        ngChecked: '=?ngChecked',
        ngDisabled: '=?ngDisabled',
      },
      link: function($scope, $element, $attrs, ctrls) {'use strict';
        var CheckboxCtrl = ctrls[0],
            ModelCtrl = ctrls[1],
            attrValue = $attrs.value;

        $scope.attrId = $attrs.id;
        $scope.attrName = $attrs.ngModel || ('checkbox-' + Date.now() + Math.round(Math.random()*100));
        $scope.attrValue = angular.isDefined($attrs.value) ? $attrs.value : true;
        $scope.attrNgChecked = $attrs.ngChecked;
        $scope.disabled = $attrs.hasOwnProperty('disabled')
        $scope.checked = angular.isBoolean($scope.ngModel) ? $scope.ngModel : $attrs.hasOwnProperty('checked');

        $scope.toggle = function(isChecked) {
          isChecked = angular.isDefined(isChecked) ? !!isChecked : !$scope.checked;
          $scope.checked = isChecked;
        };

        $element
        .removeAttr('id')
        .on('click', function(event) {
          if ($scope.disabled) {
            event.preventDefault()
            event.stopPropagation()
            return false;
          }

          $scope.toggle();

          var isChecked = $scope.checked;
          CheckboxCtrl.toggle && CheckboxCtrl.toggle(isChecked);
          $rootScope.$apply(function() {
            $scope.model = isChecked ? $scope.attrValue : false;
          });
        });

        if (angular.isUndefined($scope.model)) {
          $scope.model = $scope.checked ? $scope.attrValue : false;
        }

        $scope.$watch('ngChecked', function(isChecked) {
          if (angular.isDefined(isChecked)) {
            $element.attr('checked', isChecked);
            $scope.toggle(!!isChecked);
            CheckboxCtrl.toggle(isChecked);
            $scope.model = $scope.checked ? $scope.attrValue : false;
          }
        });

        $scope.$watch('ngDisabled', function(isDisabled) {
          if (angular.isBoolean(isDisabled)) {
            $scope.disabled = isDisabled;
          }
        });

        $scope.$watch('model', function(value) {
          var isChecked = $scope.checked = value == $scope.attrValue;

          $element.attr('checked', isChecked);
          $scope.toggle(isChecked);
          CheckboxCtrl.toggle(isChecked);
        });
      }
    };
  }
])

.directive('checkboxOrigin', [
  function() {
    return {
      restrict: 'A',
      require: '^checkbox',
      link: function($scope, $element, $attrs, ctrl) {'use strict';
        ctrl.select = function(isCheck) {
          $element
          .prop('checked', isCheck)
          .attr('checked', isCheck)
          .triggerHandler('change');
        };

        ctrl.toggle = function(isCheck) {
          ctrl.select(isCheck);
        };

        $element
        .on('change', function() {
          $scope.toggle(!!angular.element(this).prop('checked'));
        });
      }
    };
  }
])