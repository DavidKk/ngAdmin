angular.module('ui.slidedown', [
  'services.styles'
])

.constant('slidedown.config', {
  openClass: 'open'
})

.controller('SlidedownGroupController', [
  '$scope',
  function($scope) {'use strict';
    var exports = this,
        slideScope = [];

    exports.addMenuScope = function(openScope) {
      slideScope.push(openScope);
    };

    exports.closeOthers = function(openScope) {
      angular.forEach(slideScope, function(scope) {
        if (scope !== openScope) {
          scope.isOpen = false;
          scope.close();
        }
      });
    };
  }
])

.directive('slidedownGroup', [
  function() {
    return {
      restrict: 'CA',
      controller: 'SlidedownGroupController'
    };
  }
])

.controller('SlidedownController', [
  '$scope',
  function($scope) {'use strict';
    var exports = this;
    $scope.isOpen;

    exports.toggle = function(isOpen) {
      $scope.isOpen = arguments.length ? !!isOpen : !$scope.isOpen;
      exports.toggleSlide && exports.toggleSlide($scope.isOpen, exports.toggleOpen);
    };
  }
])

.directive('slidedown', [
  'slidedown.config',
  function(config) {
    return {
      controller: 'SlidedownController',
      require: ['^slidedown', '^?slidedownGroup'],
      scope: {},
      link: function($scope, $element, $attrs, ctrls) {'use strict';
        var menuCtrl = ctrls[0],
            groupCtrl = ctrls[1];

        $scope.isOpen = $attrs.isopen == 'true';

        $scope.close = function() {
          menuCtrl.toggle(false);
        };

        menuCtrl.isOpen = function() {
          return $scope.isOpen;
        };

        menuCtrl.toggleOpen = function(isOpen) {
          $element.toggleClass(config.openClass, isOpen);
          isOpen && groupCtrl && groupCtrl.closeOthers($scope);
        };

        groupCtrl && groupCtrl.addMenuScope($scope);
        menuCtrl.toggleSlide && menuCtrl.isOpen && menuCtrl.toggleSlide(menuCtrl.isOpen());
      }
    };
  }
])

.directive('slidedownList', [
  '$rootScope', '$transition',
  function($rootScope, $transition) {
    return {
      require: '^slidedown',
      link: function($scope, $element, $attrs, ctrl) {'use strict';
        var initialAnimSkip = true,
            currentTransition;

        ctrl.toggleSlide = function(isOpen) {
          isOpen ? expand(ctrl.toggleOpen) : collapse(ctrl.toggleOpen);
        };

        ctrl.toggleSlide && ctrl.isOpen && ctrl.toggleSlide(ctrl.isOpen());

        // helper
        function doTransition(change) {
          var newTransitionDone = function() {
            if (currentTransition === newTransition) {
              currentTransition = undefined;
            }
          };

          currentTransition && currentTransition.cancel();
          var newTransition = $transition($element, change);
          newTransition.then(newTransitionDone, newTransitionDone);
          return currentTransition = newTransition;
        }

        function expandDone() {
          $element
          .removeClass('collapsing')
          .addClass('collapse in')
          .css({height: 'auto'});
        }

        function collapseDone() {
          $element
          .removeClass('collapsing')
          .addClass('collapse');
        }

        function expand(toggleOpen) {
          if (initialAnimSkip) {
            initialAnimSkip = false;
            toggleOpen && toggleOpen(true);
            expandDone();
          }
          else {
            $element
            .removeClass('collapse')
            .addClass('collapsing');

            toggleOpen && toggleOpen(true);
            doTransition({ height: $element[0].scrollHeight + 'px' })
            .then(function() {
              expandDone();
              setTimeout(function() {
                angular.element(window).triggerHandler('resize');
              }, 0);
            });
          }
        }

        function collapse(toggleOpen) {
          if (initialAnimSkip) {
            initialAnimSkip = false;
            collapseDone();
            toggleOpen && toggleOpen(false);
            $element.css({ height: 0 });
          }
          else {
            $element
            .removeClass('collapse in')
            .addClass('collapsing')
            .css({ height: $element[0].scrollHeight + 'px' });

            doTransition({ height: 0 })
            .then(function() {
              collapseDone();
              toggleOpen && toggleOpen(false);
              setTimeout(function() {
                angular.element(window).triggerHandler('resize');
              }, 0);
            });
          }
        }
      }
    };
  }
])

.directive('slidedownToggle', [
  '$document',
  function($document) {
    return {
      require: '^slidedown',
      link: function($scope, $element, $attrs, ctrl) {'use strict';
        $element.on('click', function(event) {
          event.preventDefault();
          event.stopPropagation();

          !$element.attr('disabled') && !$element.prop('disabled') && ctrl.toggle();

          setTimeout(function() {
            $document.triggerHandler('click');
          }, 10);
        });
      }
    };
  }
])