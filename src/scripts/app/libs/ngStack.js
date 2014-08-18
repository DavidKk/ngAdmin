

angular.module('ngStack', [
  'config', 'ngHelper'
])

.service('$stack', [
  '$q',
  function($q) {'use strict';
    var $stack = function() {
      var exports = this;
      exports.openStack = [];
      Array.prototype.push.apply(exports.openStack, arguments);
    };

    $stack.prototype.get = function(begin, until) {
      var exports = this;
      return exports.openStack.slice(begin, until || 1);
    };

    $stack.prototype.add = function(el) {
      var exports = this;
      exports.openStack.push(el);
    };

    $stack.prototype.del = function(el, key) {
      var exports = this,
      openStack = exports.openStack,
      index = angular.isDefined(key)
        ? angular.inArray(el, openStack, key)
        : angular.inArray(el, openStack);

      openStack.splice(index, 1);
    };

    $stack.prototype.clean = function() {
      var exports = this,
      openStack = exports.openStack;
      openStack.splice(0, openStack.length);
    };

    $stack.prototype.size = function() {
      var exports = this;
      return exports.openStack.length;
    };

    $stack.prototype.forEach = function(callback) {
      var exports = this;
      angular.forEach(exports.openStack, callback);
    };

    $stack.prototype.removeInvalid = function() {
      var exports = this,
      openStack = exports.openStack,
      i;

      for (i = 0; i < openStack.length; i ++) {
        angular.isUndefined(openStack[i]) && openStack.splice(i --, 1);
      }
    };

    return $stack;
  }
])