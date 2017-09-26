/**
 * @name switch
 * @author [<David Jones qowera@qq.com>]
 * @description
 * 
 */
angular.module('ui.switch', ['templates/switch/switch.html'])

.controller('SwitchController', [
  '$scope',
  function($scope) {
    'use strict'

    $scope.checked = false

    this.transclude = function(name, content) {
      this.transclude[name](content)
    }
  }
])

.directive('switch', [
  '$rootScope',
  function($rootScope) {
    return {
      restrict: 'EA',
      transclude: true,
      replace: true,
      controller: 'SwitchController',
      templateUrl: 'templates/switch/switch.html',
      require: ['^switch', '^?ngModel'],
      scope: {
        model: '=?ngModel'
        , ngDisabled: '=?ngDisabled'
      },
      link: function($scope, $element, $attrs, ctrls, $transclude) {
        'use strict'

        var switchCtrl = ctrls[0]

        $scope.attrId = $attrs.id
        $scope.attrName = $attrs.ngModel || ('radio-' + Date.now() + Math.round(Math.random()*100))
        $scope.attrValue = angular.isDefined($attrs.value) ? $attrs.value : true
        $scope.attrType = $attrs.type || 'checkbox'
        $scope.disabled = $attrs.hasOwnProperty('disabled')
        $scope.checked = angular.isBoolean($scope.ngModel) ? $scope.ngModel : $attrs.hasOwnProperty('checked')

        if ($scope.checked) {
          $scope.model = $scope.attrValue
        }

        $scope.$watch('ngDisabled', function(isDisabled) {
          if (angular.isBoolean(isDisabled)) {
            $scope.disabled = isDisabled
          }
        })

        $scope.$watch('model', function(value, oldValue) {
          if (value !== oldValue) {
            $scope.checked = value == $scope.attrValue
          }
        })

        angular.forEach($transclude(), function(element) {
          var name = element.tagName
              .toLowerCase()
              .replace(/\-[a-z]/g, function($1) {
                return $1.replace('-', '').toUpperCase()
              })

          switchCtrl.transclude(name, element.innerHTML)
        })
      }
    }
  }
])

.directive('switchTransclude', [
  function() {
    return {
      restrict: 'EA',
      require: '^switch',
      link: function($scope, $element, $attrs, ctrl) {
        var transcludeName = $attrs.switchTransclude

        ctrl.transclude[transcludeName] = function(content) {
          $element.html(content)
        }
      }
    }
  }
])