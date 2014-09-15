

angular.module('ui.layout', [])

.controller('AsidebarCtrl', [
  '$scope',
  function($scope) {
    var exports = this;
    $scope.isOpen = false;
    exports.show = exports.hide = angular.noop;
  }
])

.directive('fixedbar', [
  '$rootScope',
  function($rootScope) {
    return {
      restrict: 'EA',
      controller: 'AsidebarCtrl',
      scope: {
        isOpen: '=?'
      },
      link: function($scope, $element, $attrs, ctrl) {
        ctrl.open = function() {
          $element.removeClass('minify');
          angular.element(document.body).addClass('fixedbar-shown');
        };

        ctrl.close = function() {
          $element.addClass('minify');
          angular.element(document.body).removeClass('fixedbar-shown');
        };

        $rootScope.$on('layout.toggleLeftSidebar', function(event, isOpen) {
          $scope.isOpen = arguments.length > 1 ? !!isOpen : !$scope.isOpen;
          $scope.isOpen ? ctrl.open() : ctrl.close();
        });

        $scope.isOpen = !!$attrs.open;
        $scope.isOpen ? ctrl.open() : ctrl.close();
      }
    };
  }
])

.directive('slidebar', [
  '$rootScope',
  function($rootScope) {
    return {
      restrict: 'EA',
      controller: 'AsidebarCtrl',
      scope: {
        isOpen: '=?'
      },
      link: function($scope, $element, $attrs, ctrl) {
        ctrl.open = function() {
          angular.element(document.body).addClass('slidebar-shown');
        };

        ctrl.close = function() {
          angular.element(document.body).removeClass('slidebar-shown');
        };

        $rootScope.$on('layout.toggleRightSidebar', function(event, isOpen) {
          $scope.isOpen = arguments.length > 1 ? !!isOpen : !$scope.isOpen;
          $scope.isOpen ? ctrl.open() : ctrl.close();
        });

        $scope.isOpen = !!$attrs.open;
        $scope.isOpen ? ctrl.open() : ctrl.close();
      }
    };
  }
])