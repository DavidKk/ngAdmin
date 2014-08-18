

angular.module('ui.tabs', [])

.constant('tabsConfig', {
  openTabClass: 'active',
  openTabToggleClass: 'active'
})

.controller('tabGroupController', [
  '$scope',
  function($scope) {
    var scopeTabs = [];

    this.addScopeTabs = function(openScope) {
      scopeTabs.push(openScope);
    };

    this.closeOthers = function(openScope) {
      angular.forEach(scopeTabs, function(scope) {
        if (scope !== openScope) scope.isOpen = false;
      });
    };
  }
])

.directive('tabGroup', [
  'tabsConfig',
  function(tabsConfig) {
    return {
      controller: 'tabGroupController',
      restrict: 'CA'
    };
  }
])

.directive('tabToggle', [
  'tabsConfig',
  function(tabsConfig) {
    return {
      require: '^tabGroup',
      scope: {
        isOpen: '=?'
      },
      link: function($scope, $element, $attrs, ctrl) {
        if (!ctrl) return false;

        $scope.isOpen = $element.parent().hasClass('active');

        ctrl.addScopeTabs($scope);

        $element.on('click', function(event) {
          event.preventDefault();
          event.stopPropagation();

          if (!$element.attr('disabled') && !$element.prop('disabled')) {
            $scope.$apply(function() {
              $scope.isOpen = true;
            });
          }
        });

        $scope.$watch('isOpen', function(isOpen) {
          var $tab = document.getElementById($attrs.href.replace('#', ''));
          $element.parent().toggleClass(tabsConfig.openTabToggleClass, isOpen || false);
          angular.element($tab).toggleClass(tabsConfig.openTabClass, isOpen || false);
          isOpen && ctrl && ctrl.closeOthers($scope);
        });
      }
    };
  }
])