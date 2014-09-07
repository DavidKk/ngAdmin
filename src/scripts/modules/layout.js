

angular.module('ui.layout', [])
.controller('Layout.LeftSidebar', [
  '$rootScope', '$scope',
  function($rootScope, $scope) {
    var exports = this;

    $scope.isOpen = false;
    $scope.minify = true;

    exports.show = function() {
      angular.element(document.body).addClass('sidebar-left-shown');
    };

    exports.hide = function() {
      angular.element(document.body).removeClass('sidebar-left-shown');
    };

    $rootScope.$on('layout.toggleLeftSidebar', function(event, isOpen) {
      $scope.isOpen = arguments.length > 1 ? !!isOpen : !$scope.isOpen;
      $scope.minify = $scope.isOpen;
    });

    $scope.$watch('isOpen', function(isOpen) {
      isOpen ? exports.show() : exports.hide();
    });  
  }
])

.controller('Layout.RightSidebar', [
  '$rootScope', '$scope',
  function($rootScope, $scope) {
    var exports = this;

    $scope.isOpen = false;

    exports.show = function() {
      angular.element(document.body).addClass('sidebar-right-shown');
    };

    exports.hide = function() {
      angular.element(document.body).removeClass('sidebar-right-shown');
    };

    $rootScope.$on('layout.toggleRightSidebar', function(event, isOpen) {
      $scope.isOpen = arguments.length > 1 ? !!isOpen : !$scope.isOpen;
    });

    $scope.$watch('isOpen', function(isOpen) {
      isOpen ? exports.show() : exports.hide();
    });  
  }
])