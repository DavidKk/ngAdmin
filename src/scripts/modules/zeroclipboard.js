

angular.module('ui.zeroclipboard', [])

.directive('zeroclipboard', [
  function() {
    return {
      restrict: 'EA',
      replace: true,
      link: function($scope, $element, $attrs) {
        
      }
    };
  }
])