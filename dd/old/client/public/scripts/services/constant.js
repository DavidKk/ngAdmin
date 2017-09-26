/**
 * constant 常量配置服务
 * @author  David Jones
 * @email   qowera@qq.com
 */
angular.module('services.constant', [])

.provider('$constant', [
  '$provide',
  function($provide) {'use strict';
    var CONSTANT = {},
        MAP = {},
        DATASOURCE = {},
        ORGIN = {};

    this.setItem = function(name, constant) {
      ORGIN[name] = constant;

      if (!angular.isArray(DATASOURCE[name])) {
        DATASOURCE[name] = [];
      }

      if (!angular.isObject(MAP[name])) {
        MAP[name] = {};
      }

      angular.forEach(constant, function(item) {
        MAP[name][item.name] = item.value;
        DATASOURCE[name].push({ NAME: item.name, VALUE: item.value, TEXT: item.text });
      });

      var mapName = name + '_MAP',
          dataSourceName = name + '_DATASOURCE';

      $provide.constant(mapName, CONSTANT[mapName] = MAP[name]);
      $provide.constant(dataSourceName, CONSTANT[dataSourceName] = DATASOURCE[name]);
      return this;
    };

    this.getItem = function(name) {
      return ORGIN[name];
    };

    this.$get = [
      function() {
        var $constant = {};
        $constant.get = function(name) {
          return CONSTANT[name];
        };

        $constant.getMap = function(name) {
          return MAP[name];
        };

        $constant.getDatasource = function(name) {
          return DATASOURCE[name];
        };

        $constant.getOrigin = function(name) {
          return ORGIN[name];
        };

        return $constant;
      }
    ];
  }
])