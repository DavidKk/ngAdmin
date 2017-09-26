angular.module('services.model', [])

.provider('$model', [
  function() {
    var API_PATH = '/',
        defaultParams = {};

    this.setBasePath = function(url) {
      if (angular.isString(url)) {
        API_PATH = url;
      }
    };

    this.setDefaultParams = function(params) {
      if (angular.isObject(params)) {
        defaultParams = params;
      }
    };

    this.$get = [
      '$http', '$q',
      function($http, $q) {
        var $model = {};

        /**
         * request
         * @param  {String}   method    请求类型
         * @param  {String}   api       API URL
         * @param  {Object}   datas     传输数据
         * @param  {Function} validate  验证函数
         * @return {Object}             request().setData(data).validate(func).query()
         */
        $model.request = function(method, api, datas, validate, response) {
          return {
            method: function(_method) {
              return $model.request(_method, api, datas, validate, response);
            },
            url: function(_api) {
              return $model.request(method, _api, datas, validate, response);
            },
            data: function(_datas) {
              return $model.request(method, api, _datas, validate, response);
            },
            pushData: function(_datas) {
              return $model.request(method, api, angular.extend(datas || {}, _datas), validate, response);
            },
            validate: function(_validate) {
              return $model.request(method, api, datas, _validate, response);
            },
            response: function(_response) {
              return $model.request(method, api, datas, validate, _response);
            },
            query: function() {
              return request(method, api, datas, validate, response);
            }
          };
        };

        /**
         * $get GET AJAX REQUEST
         * @param  {String}   api       API URL
         * @param  {Object}   datas     传输数据
         * @return {Object}             Promise
         */
        $model.get = function(api, datas) {
          return $model.request('GET', api, datas);
        };

        /**
         * $post POST AJAX REQUEST
         * @param  {String}   api       API URL
         * @param  {Object}   datas     传输数据
         * @return {Object}             Promise
         */
        $model.post = function(api, datas) {
          return $model.request('POST', api, datas);
        };

        /**
         * $put PUT AJAX REQUEST
         * @param  {String}   api       API URL
         * @param  {Object}   datas     传输数据
         * @return {Object}             Promise
         */
        $model.put = function(api, datas) {
          return $model.request('PUT', api, datas);
        };

        /**
         * $delete DELETE AJAX REQUEST
         * @param  {String}   api       API URL
         * @param  {Object}   datas     传输数据
         * @return {Object}             Promise
         */
        $model.delete = function(api, datas) {
          return $model.request('DELETE', api, datas);
        };

        /**
         * $_callAJAXInHTML5 Cross domain in postMessage
         * @param  {String}   method    请求类型
         * @param  {String}   api       URL
         * @param  {Object}   datas     发送数据
         * @param  {Function} validate  验证 handle
         * @return {Object}             Promise
         */
        function request(method, api, datas, validate, response) {
          var deferred = $q.defer(),
              args = Array.prototype.slice.call(arguments, 1, arguments.length),
              error;

          if (angular.isFunction(validate) ? true === (error = validate.call(this, datas, args)) : true) {
            method = -1 !== angular.inArray(method, ['POST', 'PUT', 'DELETE']) ? 'POST' : 'GET';
            api = API_PATH + api;
            datas = angular.extend({}, defaultParams, datas || {});

            if ('GET' === method && !angular.isEmptyObject(datas)) {
              api = api + (api.match('\\\?') ? '&' : '?') + angular.parseString(datas);
            }

            $http({ method: method, url: api, data: datas })
            .success(function(res) {
              var data = res.data;
              if (0 == res.code) {
                deferred.resolve(angular.isFunction(response) ? response(data) : data);
              }
              else if (50003 == res.code) {
                deferred.reject('系统提示：你还没有登录，正在为你跳转到登录页面！', res);

                setTimeout(function() {
                  window.location.href = data.url;
                }, 1000);
              }
              else if (50007 == res.code) {
                deferred.reject('系统提示，你没有权限访问页面，请从微力后台登陆！', res);

                setTimeout(function() {
                  window.location.href = '/error/403/';
                }, 1000);
              }
              else {
                deferred.reject((50001 == res.code ? '程序错误：' : '系统错误：') + res.code + '；错误信息：' + res.msg + '；请刷新再试或联系客服。', res);
              }
            });
          }
          else {
            deferred.reject('程序错误，错误信息：' + error + '；', { code: 0, msg: error });
          }

          return deferred.promise;
        }

        return $model;
      }
    ];
  }
])