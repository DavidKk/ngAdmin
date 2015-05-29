

angular.module('ui.radio', [])

.controller('RadioController', [
  '$scope',
  function($scope) {'use strict';
    $scope.checked = false;
  }
])

.directive('radio', [
  '$rootScope',
  function($rootScope) {
    return {
      restrict: 'EA',
      transclude: true,
      replace: true,
      controller: 'RadioController',
      templateUrl: 'template/radio/radio.html',
      require: ['^radio', '^?ngModel'],
      scope: {
        model: '=?ngModel',
        ngDisabled: '=?ngDisabled'
      },
      link: function($scope, $element, $attrs, ctrls) {'use strict';
        var RadioCtrl = ctrls[0],
            ModelCtrl = ctrls[1];

        $scope.attrId = $attrs.id;
        $scope.attrName = $attrs.ngModel || ('radio-' + Date.now() + Math.round(Math.random()*100));
        $scope.attrValue = $attrs.value;
        $scope.disabled = $attrs.hasOwnProperty('disabled');
        $scope.checked = angular.isBoolean($scope.ngModel) ? $scope.ngModel : $attrs.hasOwnProperty('checked');

        $scope.toggle = function(isCheck) {
          isCheck = angular.isDefined(isCheck) ? !!isCheck : !$scope.checked;
          $scope.checked = isCheck;
        };

        $element
        .removeAttr('id')
        .on('click', function() {
          if ($scope.disabled) {
            return false;
          }

          $scope.toggle(true);
          RadioCtrl.toggle && RadioCtrl.toggle($scope.checked);
          $rootScope.$apply(function() {
            $scope.model = $scope.attrValue;
          });
        });

        if ($scope.checked) {
          $scope.model = $scope.attrValue;
        }

        $scope.$watch('ngDisabled', function(isDisabled) {
          if (angular.isBoolean(isDisabled)) {
            $scope.disabled = isDisabled;
          }
        });

        $scope.$watch('model', function(value) {
          $scope.checked = value == $scope.attrValue;
          $element.attr('checked', $scope.checked);
          if ($scope.checked) {
            $scope.toggle(true);
            RadioCtrl.toggle(true);
          }
        });
      }
    };
  }
])

.directive('radioOrigin', [
  function() {
    return {
      restrict: 'A',
      require: '^radio',
      link: function($scope, $element, $attrs, ctrl) {'use strict';
        ctrl.select = function() {
          if ($scope.attrName) {
            var radioes = (function() {
              var radioes = [];
              angular.forEach(document.getElementsByTagName('input'), function(input) {
                if ('radio' === input.type && input.name === $scope.attrName) {
                  radioes.push(input);
                }
              });

              return radioes;
            })();

            angular.forEach(radioes, function(radio) {
              if (radio !== $element[0]) {
                angular.element(radio)
                .prop('checked', false)
                .attr('checked', false)
                .triggerHandler('change');
              }
            });
          }

          $element
          .prop('checked', true)
          .attr('checked', true)
          .triggerHandler('change');
        };

        ctrl.toggle = function(isCheck) {
          isCheck && ctrl.select();
        };

        $element
        .on('change', function() {
          $scope.toggle(!!angular.element(this).prop('checked'));
        });
      }
    };
  }
])