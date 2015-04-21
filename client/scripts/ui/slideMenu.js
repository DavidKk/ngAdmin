

angular.module('ui.slideMenu', [])

.constant('slideMenuConfig', {
  openClass: 'open'
})

.controller('SlideMenuController', [
  '$rootScope', '$scope',
  function($rootScope, $scope) {
    $scope.isOpen;
    this.openScope = $scope;

    this.toggle = function(isOpen) {
      var args = arguments;
      $scope.$apply(function() {
        $scope.isOpen = args.length ? !!isOpen : !$scope.isOpen;
      });

      return $scope.isOpen;
    };

    $scope.$watch('isOpen', function(isOpen) {
      if (angular.isDefined(isOpen)) {
        angular.isFunction($scope.onToggle) && $scope.onToggle(!!isOpen);
        angular.isFunction($scope.onSlide) && $scope.onSlide(!!isOpen);
      }
    });

    $scope.$on('$close', function() {
      $scope.isOpen = false;
    });
  }
])

.controller('SlideMenuGroupController', [
  '$scope',
  function($scope) {
    var menuScopes = [];

    this.closeOthers = function(openScope) {
      angular.forEach(menuScopes, function(scope) {
        if (scope !== openScope) scope.isOpen = false;
      });
    };

    this.addMenuScope = function(openScope) {
      menuScopes.push(openScope);
    };
  }
])

.directive('slideMenu', [
  'slideMenuConfig',
  function(slideMenuConfig) {
    return {
      controller: 'SlideMenuController',
      scope: {
        isOpen: '=?'
      },
      require: ['^slideMenu', '^?slideMenuGroup'],
      link: function($scope, $element, $attrs, ctrls) {
        var groupCtrl = ctrls[1];
        groupCtrl && groupCtrl.addMenuScope($scope);

        $scope.isOpen = $attrs.open == 'true' ? true : false;

        $scope.onToggle = function(isOpen) {
          $element.toggleClass(slideMenuConfig.openClass, isOpen);
          isOpen && groupCtrl && groupCtrl.closeOthers($scope);
        };
      }
    };
  }
])

.directive('slideMenuGroup', [
  function() {
    return {
      restrict: 'CA',
      controller: 'SlideMenuGroupController'
    };
  }
])

.directive('slideMenuList', [
  '$transition',
  function($transition) {
    return {
      require: '^slideMenu',
      link: function($scope, $element, $attrs, ctrls) {
        var openScope = ctrls.openScope,
        initialAnimSkip = true,
        currentTransition;

        function doTransition(change) {
          var newTransition = $transition($element, change);
          if (currentTransition) currentTransition.cancel();

          currentTransition = newTransition;
          newTransition.then(newTransitionDone, newTransitionDone);
          return newTransition;

          function newTransitionDone() {
            // Make sure it's this transition, otherwise, leave it alone.
            if (currentTransition === newTransition) {
              currentTransition = undefined;
            }
          }
        }

        function expandDone() {
          $element.removeClass('collapsing');
          $element.addClass('collapse in');
          $element.css({height: 'auto'});
        }

        function collapseDone() {
          $element.removeClass('collapsing');
          $element.addClass('collapse');
        }

        function expand() {
          if (initialAnimSkip) {
            initialAnimSkip = false;
            expandDone();
          }
          else {
            $element.removeClass('collapse').addClass('collapsing');
            doTransition({ height: $element[0].scrollHeight + 'px' }).then(expandDone);
          }
        }

        function collapse() {
          if (initialAnimSkip) {
            initialAnimSkip = false;
            collapseDone();
            $element.css({height: 0});
          }
          else {
            // CSS transitions don't work with height: auto, so we have to manually change the height to a specific value
            $element.css({ height: $element[0].scrollHeight + 'px' });
            // trigger reflow so a browser realizes that height was updated from auto to a specific value
            var x = $element[0].offsetWidth;
            $element.removeClass('collapse in').addClass('collapsing');
            doTransition({ height: 0 }).then(collapseDone);
          }
        }

        openScope.onSlide = function(isOpen) {
          isOpen ? expand() : collapse();
        };
      }
    };
  }
])

.directive('slideMenuToggle', [
  '$document',
  function($document) {
    return {
      require: '^slideMenu',
      link: function($scope, $element, $attrs, ctrl) {
        $element.on('click', function(event) {
          event.preventDefault();
          event.stopPropagation();

          !$element.attr('disabled') && !$element.prop('disabled') && ctrl.toggle();
          setTimeout(function() { $document.triggerHandler('click'); }, 10);
        });
      }
    };
  }
])