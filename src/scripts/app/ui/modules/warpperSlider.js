

angular.module('ui.wrapper', [])

.directive('wrapperSlider', [
  '$transition',
  function($transition) {'use strict';
    return {
      restrict: 'EA',
      require: '?ngModel',
      scope: {},
      link: function($scope, $element, $attrs, ctrl) {
        var lastPercentage = 0, num = $attrs.number,
        isWrap = $element[0].offsetWidth > window.outerWidth,
        step = isWrap ? -100 : 100/num,
        minX = isWrap ? (num -1)*step : 0,
        maxX = isWrap ? 0 : (num -1)*step,
        startX, endX, deltaX, point, isDrag, part,
        percentage, currentTransition;

        function doTransition(change) {
          var newTransition = $transition($element, change);
          if (currentTransition) currentTransition.cancel();

          currentTransition = newTransition;
          newTransition.then(newTransitionDone, newTransitionDone);
          return newTransition;

          function newTransitionDone() {
            if (currentTransition === newTransition) {
              currentTransition = undefined;
            }
          }
        }

        function moveTo(position) {
          $element.addClass('move');
          position = Math.min(Math.max(position, minX), maxX);
          doTransition({ left: position + '%' }).
          then(function() { $element.removeClass('move'); });
        }

        function moveToPart(part, isDrag) {
          if (part < 0) return;

          if (isDrag || Math.abs(percentage)%Math.abs(step) > Math.abs(step)/2) {
            part = part + (startX > endX ? 1 : 0);
            percentage = step*part;
          }
          else percentage = step*part;
          
          moveTo(percentage);
          ctrl.$setViewValue(part);
          lastPercentage = percentage;
        }

        function touchstart(event) {
          point = event.changedTouches ? event.changedTouches[0] : event;
          startX = point.pageX;
          angular.element(window).on('touchmove mousemove', touchmove);
        }

        function touchmove(event) {
          isDrag = true;

          point = event.changedTouches ? event.changedTouches[0] : event;
          deltaX = point.pageX - startX;

          if (isWrap) percentage = deltaX/window.outerWidth*100;
          else percentage = -(deltaX/window.outerWidth*100/num);

          percentage += lastPercentage;
          percentage = Math.max(Math.min(percentage, maxX), minX);
          $element.css('left', percentage + '%');
        }

        function touchend(event) {
          if (!isDrag) return;
          point = event.changedTouches ? event.changedTouches[0] : event;
          endX = point.pageX;

          moveToPart(Math.floor(percentage/step), isWrap ? true : false);
          angular.element(window).off('touchmove', touchmove);
        }

        // angular.element(window).
        // on('touchstart', touchstart).
        // on('touchend', touchend);

        $scope.$watch(function() { return ctrl.$modelValue; }, function(value) {
          moveToPart(value || 0);
        });
      }
    };
  }
])