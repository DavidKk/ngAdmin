angular.module('helpers.array', [])

.run([
  function() {
    'use strict'

    /**
     * inArray 获取元素在数组中所在位置的键值
     * @param  {Anything} value 要获取键值的元素
     * @param  {Array}    array 数组
     * @return {Integer}        键值
     */
    angular.inArray = function(value, array) {
      if (Array.prototype.indexOf && angular.isFunction(array.indexOf)) {
        return array.indexOf(value);
      }
      else {
        for (var i = 0; i < array.length; i ++) {
          if (array[i] === value) return i;
        }

        return -1;
      }
    };

    angular.filter = function(array, callback) {
      if (Array.prototype.filter) {
        return Array.prototype.filter.call(array, callback);
      }
      else {
        for (var i = 0; i < array.length; i ++) {
          if (false === callback(array[i])) {
            array.splice(i --, 1);
          }
        }
      }
    };

    /**
     * inArrayBy inArray 增强版，获取数组中元素拥有与要查询元素相同的属性值的键值
     * @param  {Object|Integer} object_or_index 对象或数字(数字用于数组下标)
     * @return {Integer}                        键值，不存在返回 -1;
     */
    angular.inArrayBy = function(object_or_index, array, index_name) {
      var index,
          i = 0,
          l = array.length;

      index = angular.isObject(object_or_index)
      ? object_or_index[index_name]
      : index = object_or_index;

      for (; i < l; i ++) {
        if (array[i][index_name] == index) {
          return i;
        }
      }

      return -1;
    };

    /**
     * unique 去重
     * @param  {Array} arr 数组
     * @return {Array}     去重后的数组
     */
    angular.unique = function(arr) {
      var n = {},
          r = [],
          i = 0;

      for (i = 0; i < arr.length; i ++) {
        if (!n[arr[i]]) {
          n[arr[i]] = true; 
          r.push(arr[i]); 
        }
      }

      return r;
    };

  }
])