

angular.module('chat', [])

.directive('chatLayout', [
  '$rootScope',
  function($rootScope) {
    return {
      restrict: 'A',
      link: function($scope, $element, $attrs, ctrl) {'use strict';
        function open() {
          angular.element(document.body).addClass('show-chat');
        }

        function close() {
          angular.element(document.body).removeClass('show-chat');
        }

        $rootScope.$on('layout.toggle.chat', function(event, isOpen) {
          $scope.isOpen = arguments.length > 1 ? !!isOpen : !$scope.isOpen;
          $scope.isOpen ? open() : close();
        });

        $scope.isOpen = !!$attrs.open;
        $scope.isOpen ? open() : close();
      }
    };
  }
])

.controller('Chat', [
  '$scope',
  function($scope) {'use strict';
    $scope.isOpenBox = false;

    $scope.openBox = function() {
      $scope.isOpenBox = true;
    };

    $scope.closeBox = function() {
      $scope.isOpenBox = false;
    };

    $scope.toggleBox = function() {
      $scope.isOpenBox = !$scope.isOpenBox;
    };
  }
])

.controller('ChatBox', [
  '$scope',
  function($scope) {'use strict';

  }
])