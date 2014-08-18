

angular.module('ngWebSocket', [
  'config', 'ngHelper'
])

.provider('$webSocket', [
  function() {
    var providerExports = this,
    webSocketReady = false,
    queue = {},
    webSocket;

    providerExports.defaults = {};
    providerExports.defaults.onopen;
    providerExports.defaults.onerror;
    providerExports.defaults.responseMessage;
    providerExports.defaults.responseError;
    providerExports.defaults.responseComplate;

    providerExports.$get = [
      '$rootScope',
      function($rootScope) {
        var exports = {};
        exports.$$connectHost;

        exports.connect = function(host) {
          exports.$$connectHost = host;
          webSocket = new WebSocket(host);

          webSocket.onopen = function() { angular.isFunction(providerExports.defaults.onopen) && providerExports.defaults.onopen(); };
          webSocket.onerror = function() { angular.isFunction(providerExports.defaults.onerror) && providerExports.defaults.onerror(); };
          webSocket.onmessage = function(event) {
            try {
              // Success
              var response = angular.fromJson(event.data);
              angular.forEach(queue['success'] || [], function(handle) {
                $rootScope.$apply(function() { handle(response, 'success', event); });
              });

              angular.isFunction(providerExports.defaults.responseMessage) && providerExports.defaults.responseMessage(response, 'success', event);
            }
            catch (error) {
              // Error
              angular.forEach(queue['error'] || [], function(handle) {
                $rootScope.$apply(function() { handle(event.data, event, error); });
              });

              angular.isFunction(providerExports.defaults.responseError) && providerExports.defaults.responseError(event.data, event, error);
            }

            // Complated
            angular.forEach(queue['complete'] || [], function(handle) {
              $rootScope.$apply(function() { handle(event.data, event); });
            });

            angular.isFunction(providerExports.defaults.responseComplate) && providerExports.defaults.responseComplate(event.data, event);
          };

          ! (function poll() {
            webSocketReady = webSocket.readyState === 1;
            if (webSocketReady) {
              angular.forEach(queue['send'], function(handle) { handle(); });
              delete queue['send'];
            }
            else setTimeout(poll, 100);
          })();
        };

        exports.$on = function(type, handle) {
          if (! angular.isFunction(handle)) return this;

          if (! angular.isArray(queue[type])) queue[type] = [];
          queue[type].push(handle);

          return this;
        };

        exports.send = function(message) {
          var sendData = angular.toJson(message);
          if (webSocketReady === true) webSocket.send(sendData);
          else {
            if (! angular.isArray(queue['send'])) queue['send'] = [];
            queue['send'].push(function() { webSocket.send(sendData); });
          }
        };

        return exports;
      }
    ];
  }
]);