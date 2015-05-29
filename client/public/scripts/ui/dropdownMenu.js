/**
 * DropdownMenu
 * @author <David Jones qowera@qq.com>
 */
angular.module('ui.dropdownMenu', [])

.constant('dropdownMenuConfig', {
  openClass: 'open'
  , activeClass: 'active'
  , hideClass: 'hide'
})

.service('dropdownMenuService', [
  '$document',
  function($document) {
    var openScope

    function openDropdown() {
      openScope.$apply(function() {
        openScope.isOpen = true
      })
    }

    function closeDropdown() {
      openScope.$apply(function() {
        openScope.isOpen = false
      })
    }

    function escapeKeyBind(event) {
      if (event.keyCode === 27) {
        closeDropdown()
      }
      else {
        openScope.onControl(event)
      }
    }

    this.open = function(dropdownScope) {
      if (!openScope) {
        $document.on('click', closeDropdown)
        $document.on('keydown', escapeKeyBind)
      }

      if (openScope && openScope !== dropdownScope) {
        openScope.isOpen = false
      }

      openScope = dropdownScope
    }

    this.close = function(dropdownScope) {
      if (openScope === dropdownScope) {
        $document.off('click', closeDropdown)
        $document.off('keydown', escapeKeyBind)
        openScope = null
      }
    }
  }
])

.controller('DropdownMenuController', [
  '$scope',
  'dropdownMenuService',
  function($scope, dropdownMenuService) {
    var exports = this
    $scope.isOpen = false

    exports.toggle = function(open) {
      var args = arguments

      $scope.$apply(function() {
        $scope.isOpen = args.length ? !!open : !$scope.isOpen
        exports.$filterElement && setTimeout(function() { exports.$filterElement[0].focus('focus'); }, 300)
      })

      return $scope.isOpen
    }

    exports.filter = function(filterStr) {
      if (angular.isString(filterStr)) {
        $scope.$apply(function() {
          $scope.filter = filterStr
        })
      }
    }

    $scope.$watch('isOpen', function(isOpen) {
      $scope.onToggle(!!isOpen);

      if (isOpen) {
        dropdownMenuService.open($scope, exports);
        angular.isFunction(exports.onFocus) && exports.onFocus();
      }
      else {
        dropdownMenuService.close($scope, exports);
      }
    })

    $scope.$watch('filter', function(filter) {
      angular.isString(filter) && $scope.onFilter(filter)
    })

    $scope.$on('$closeDropdown', function() {
      $scope.isOpen = false
    })
  }
])

.directive('dropdownMenu', [
  'dropdownMenuConfig',
  function(dropdownMenuConfig) {
    return {
      restrict: 'EA',
      controller: 'DropdownMenuController',
      scope: {
        isOpen: '=?',
        filter: '=?'
      },
      link: function($scope, $element, $attrs, ctrl) {

        $scope.onToggle = function(isOpen) {
          $element.toggleClass(dropdownMenuConfig.openClass, isOpen)
        };

        $scope.onFilter = function(filterStr) {
          angular.isFunction(ctrl.onFilter) && ctrl.onFilter(filterStr)
        };

        $scope.onControl = function(event) {
          if (-1 !== angular.inArray(event.keyCode, [38, 40])) {
            event.preventDefault()
            ctrl.onChooseByKey(event.keyCode === 38 ? 'up' : 'down')
          }
          else if (event.keyCode === 13) {
            ctrl.onSelect()
          }
        }
      }
    }
  }
])

.directive('dropdownMenuDialog', [
  'dropdownMenuConfig',
  function(dropdownMenuConfig) {
    return {
      restrict: 'EA',
      require: '?^dropdownMenu',
      link: function($scope, $element, $attrs, ctrl) {
        $element.on('click', function(event) {
          event.stopPropagation()
        })
      }
    };
  }
])

.directive('dropdownMenuFilter', [
  function() {
    return {
      restrict: 'EA',
      require: '^dropdownMenu',
      link: function($scope, $element, $attrs, ctrl) {
        ctrl.$filterElement = $element

        $element.
        on('click', function(event) {
          event.preventDefault()
          event.stopPropagation()
        }).
        on('keyup', function() {
          var value = $element.val()
          ctrl.filter(value)
        })
      }
    }
  }
])  

.directive('dropdownMenuList', [
  'dropdownMenuConfig',
  function(dropdownMenuConfig) {
    return {
      restrict: 'EA',
      require: '?^dropdownMenu',
      link: function($scope, $element, $attrs, ctrl) {        
        ctrl.onFilter = function(filterStr) {
          if ('string' === typeof filterStr) {
            angular.forEach($element.children(), function(elem) {
              filterStr = filterStr.toLowerCase()

              var text = angular.element(elem).text().toLowerCase()
                  , liElem = angular.element(elem)

              if (liElem.hasClass(dropdownMenuConfig.activeClass)) {
                liElem.removeClass(dropdownMenuConfig.hideClass)
              }
              else {
                liElem.toggleClass(dropdownMenuConfig.hideClass, !text.match(filterStr))
              }

              ctrl.onFocus()
            })
          }
        }

        ctrl.onFocus = function() {
          var liElem = $element.children()
              , curElem
              , offsetTop

          for (var i = 0, l = liElem.length; i < l; i ++) {
            curElem = angular.element(liElem[i])

            if (curElem.hasClass(dropdownMenuConfig.activeClass)) {
              offsetTop = curElem.prop('offsetTop')
              height = curElem.prop('offsetHeight')

              $element.prop('scrollTop', offsetTop - height - 9)
              break
            }
          }
        };

        ctrl.onChooseByKey = function(type) {
          var liElem = $element.children()
              , arrElem = []
              , next = type === 'up' ? -1 : 1

          for (var i = 0, curLiElement; i < liElem.length; i ++) {
            curLiElement = angular.element(liElem[i])

            if (curLiElement.hasClass(dropdownMenuConfig.hideClass) && !curLiElement.hasClass(dropdownMenuConfig.activeClass)) {
              continue
            }

            arrElem.push(liElem[i])
          }

          for (var i = 0, l = arrElem.length, curLiElement, nextLiElement; i < l; i ++) {
            curLiElement = angular.element(arrElem[i])
            nextLiElement = angular.element(arrElem[i + next])

            if (curLiElement.hasClass(dropdownMenuConfig.activeClass)) {
              if (arrElem[i + next]) {
                curLiElement.removeClass(dropdownMenuConfig.activeClass)
                nextLiElement.addClass(dropdownMenuConfig.activeClass)

                var scrollTop = $element.prop('scrollTop')
                    , screenHeight = $element.prop('offsetHeight')
                    , offsetTop = nextLiElement.prop('offsetTop')
                    , height = nextLiElement.prop('offsetHeight')

                if (offsetTop - height < scrollTop || offsetTop > scrollTop + screenHeight) {
                  if (type === 'up') $element.prop('scrollTop', offsetTop - height -9)
                  else $element.prop('scrollTop', offsetTop - screenHeight)
                }          
              }

              break
            }
          }
        }

        ctrl.onSelect = function() {
          var liElem = $element.children()
              , curElem
              , offsetTop

          for (var i = 0; i < liElem.length; i ++) {
            curElem = angular.element(liElem[i])

            if (curElem.hasClass(dropdownMenuConfig.activeClass)) {
              curElem.children()[0].click()
              break
            }
          }
        }

        $element.on('click', function(event) {
          event.stopPropagation()
        })
      }
    }
  }
])

.directive('dropdownMenuToggle', [
  function() {
    return {
      restrict: 'EA',
      require: '^dropdownMenu',
      link: function($scope, $element, $attrs, ctrl) {
        $element.on('click', function(event) {
          event.preventDefault()
          event.stopPropagation()
          !$element.attr('disabled') && !$element.prop('disabled') && ctrl.toggle()
        })
      }
    }
  }
])