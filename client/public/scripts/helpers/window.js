!(function(angular, window) {'use strict';

/**
 * isWindow 判断对象是否为 window 对象
 * @param  {Object}  a 要检测的对象
 * @return {Boolean}
 */
angular.isWindow = function(a) {
  return null != a && a === a.window;
};

})(angular, window);
