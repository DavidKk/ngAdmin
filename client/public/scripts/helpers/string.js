!(function(angular, window) {'use strict';

/**
 * isEn 判断字符串是否为英文
 * @param  {String}  str 字符串
 * @return {Boolean}
 */
angular.isEn = function(str) {
  var reg = /^[a-zA-Z0-9]+$/ig;
  return reg.test(str);
};

/**
 * isCh 判断字符串是否为中文
 * @param  {String}  str 字符串
 * @return {Boolean}
 */
angular.isCh = function(str) {
  var reg = /^[\u4E00-\uFA29]+$/ig;
  return reg.test(str);
};

/**
 * isNumeric 判断字符串是否为数字
 * @param  {String}  number 需要判断的字符串
 * @return {Boolean}        True|False
 */
angular.isNumeric = function(number) {
  return !angular.isArray(number) && number - parseFloat(number) >= 0;
};

/**
 * isIngeter 判断字符串或数字是否为整数
 * @param  {String}  number 需要判断的字符串或数字
 * @return {Boolean}        True|False
 */
angular.isIngeter = function(number) {
  return angular.isNumeric(number) && parseInt(number) == parseFloat(number);
};

/**
 * isUrl 判断字符串是否为URL地址
 * @param  {String}  url 需要判断的URL
 * @return {Boolean}     True|False
 */
angular.isUrl = function(url) {
  return /^(https?:\/\/)?((([a-z\d]([a-z\d-]*[a-z\d])*)\.)+[a-z]{2,}|((\d{1,3}\.){3}\d{1,3}))(\:\d+)?(\/[-a-z\d%_.~+]*)*(\?[;&a-z\d%_.~+=-]*)?(\#[-a-z\d_]*)?$/.test(url);
};

/**
 * getLen 获取字符串英文长度（只获取英文部分）
 * @param  {String}  str 字符串
 * @return {Integer}
 */
angular.getEnLen = function(str) {
  var mh = str && str.match(/[^\u4E00-\uFA29]/ig);
  return mh ? mh.length : 0;
};

/**
 * getChLen 获取字符串中文长度（只获取中文部分）
 * @param  {String}  str 字符串
 * @return {Integer}
 */
angular.getChLen = function(str) {
  var mh = str && str.match(/[\u4E00-\uFA29]/ig);
  return mh ? mh.length * 2 : 0;
};

/**
 * getNumLen 获取数字字符串长度
 * @param  {String} str 字符串
 * @return {Integer}
 */
angular.getNumLen = function(str) {
  var mh = str && str.match(/[0-9]/ig);
  return mh ? mh.length : 0;
};

/**
 * getLen 获取字符串长度（区分中英文）
 * @param  {String}  str 字符串
 * @return {Integer}
 */
angular.getLen = function(str) {
  var ch = angular.getChLen(str);
  var en = angular.getEnLen(str);
  return ch + en;
};

/**
 * getLenInCh 按中文占字节数获取字符串长度（多数用于多少个字）
 * @param  {String}  str 字符串
 * @return {Integer}
 */
angular.getLenInCh = function(str) {
  var len = angular.getLen(str);
  return Math.ceil(len/2);
};

/**
 * toNumber 强制转换成数字 (当为 NaN时，自动转成 0)
 * @param  {String} str 字符串
 * @return {Number}
 */
angular.toNumber = function(str) {
  var num = str*1;
  return isNaN(num) ? 0 : num;
};


})(angular, window);
