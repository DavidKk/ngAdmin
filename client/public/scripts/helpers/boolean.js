!(function(angular, window) {'use strict';

/**
 * isBoolean 判断对象是否为 boolean 类型
 * @param  {Anything} a 需要判断的对象
 * @return {Boolean}    True|False
 */
angular.isBoolean = function(a) {
  return a === true || a === false || Object.prototype.toString.call(a) == '[object Boolean]';
};

})(angular, window);