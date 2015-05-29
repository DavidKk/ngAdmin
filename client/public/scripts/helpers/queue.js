/**
 * Queue
 * @author  <David Jones qowera@qq.com>
 */
angular.module('helpers.queue', [])

.config([
  function() {
    'use strict'

    /**
     * queue 异步队列
     * @param  {Array}  queue 队列方法
     * @return {Object}       异步队列
     *
     * Example:
     * var i = 0;
     * function f1(next) {
     *   setTimeout(function() {
     *     console.log(i ++);
     *     next && next();
     *   }, 1000);
     * }
     *
     * angular.syncQueue([f1, f1, f1]);
     * run -> sleep 1s -> 1 -> sleep 1s -> 2 -> sleep 1s -> 3 -> end
     */
    angular.syncQueue = (function() {
      var SyncQueue = function(queue) {
        this.length = 0
        Array.prototype.push.call(this)

        var l = queue.length
            , i = 0;

        for (; i < l; i ++) {
          this.add(queue[i])
        }
      }

      SyncQueue.prototype.add = function(func) {
        var i = Array.prototype.push.call(this, function() {
          return func(this[i])
        })

        return this
      }

      SyncQueue.prototype.del = function(index) {
        index > -1 && Array.prototype.splice.call(this, index, 1)
        return this
      }

      SyncQueue.prototype.digest = function() {
        this[0]()
        return this
      }

      SyncQueue.prototype.destory = function() {
        Array.prototype.splice.call(this, 0, this.length)
      }

      return function(queue) {
        return queue && queue.length > 0
        ? (new SyncQueue(queue)).digest()
        : new SyncQueue()
      }

    })()
  }
])
