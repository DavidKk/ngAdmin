!(function(angular, window) {'use strict';

/**
 * isImage 是否为图片
 * @param  {String}  filename  文件名称
 * @param  {Array}   allowType 允许类型
 * @return {Boolean}
 */
angular.isImage = function(filename, allowType) {
  allowType = $.isArray(allowType) ? allowType : ['JPG', 'JPEG', 'GIF', 'PNG', 'APNG', 'BMP'];
  var ext = angular.$getFileExt(filename);
  return -1 !== $.inArray(ext.toUpperCase(), allowType);
};

/**
 * getFileExt 获取文件后缀名
 * @param  {String}  filename 文件名
 * @return {String}
 */
angular.getFileExt = function(filename) {
  var extStart  = filename.lastIndexOf('.') + 1;
  return filename.substring(extStart, filename.length);
};


})(angular, window);
