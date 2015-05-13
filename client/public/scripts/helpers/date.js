!(function(angular, window) {'use strict';

/**
 * dateAdjust 调节时间，对时间进行加减运算
 * @param  {Date}     date   Date 对象
 * @param  {String}   part   需要修改的类型
 * @param  {Integer}  amount 需要调整的值
 *
 * Example:
 * angular.dateAdjust(new Date(), 'years', +1);
 */
angular.dateAdjust = function(date, part, amount) {
  part = part.toLowerCase();
  amount = amount || 0;

  var map = { 
        years: 'FullYear', months: 'Month', weeks: 'Hours', days: 'Hours', hours: 'Hours', 
        minutes: 'Minutes', seconds: 'Seconds', milliseconds: 'Milliseconds',
        utcyears: 'UTCFullYear', utcmonths: 'UTCMonth', utcweeks: 'UTCHours', utcdays: 'UTCHours', 
        utchours: 'UTCHours', utcminutes: 'UTCMinutes', utcseconds: 'UTCSeconds', utcmilliseconds: 'UTCMilliseconds'
      },
      mapPart = map[part];

  if (part == 'weeks' || part == 'utcweeks') {
    amount *= 168;
  }

  if (part == 'days' || part == 'utcdays') {
    amount *= 24;
  }

  var setFucName = 'set' + mapPart,
      getFuncName = 'get'+ mapPart;

  date[setFucName](date[getFuncName]() + amount);
};


/**
 * dateEach 遍历日期
 * @param  {Date}     beginDate           开始时间
 * @param  {Date}     endDate             结束时间
 * @param  {Function} callback            回调函数
 * @param  {String}   part(optional)      需要遍历的部分(默认为 'days')
 * @param  {Number}   step(optional)      每次跳跃数字(默认为 1)
 * @param  {Object}   bind(optional)      回调函数从属的对象(默认为 window)
 *
 * Example:
 * angular.dateEach(DateA, DateB, function(currentDate, times, beginDate, endDate) {
 *   // Something to do...
 * });
 */
angular.dateEach = function(beginDate, endDate, callback, part, step, bind) {
  var part = 'string' === typeof part ? part : 'days',
      step = 'number' === typeof step ? step : 1,
      bind = bind || window,
      fromDate = new Date(beginDate.getTime()),
      toDate = new Date(endDate.getTime()),
      pm = fromDate <= toDate ? 1 : -1,
      i = 0;

  while ((pm === 1 && fromDate <= toDate) || (pm === -1 && fromDate >= toDate)) {
    if (callback.call(bind, fromDate, i, beginDate, endDate) === false) {
      break;
    }

    i += step;
    angular.dateAdjust(fromDate, part, step*pm);
  }
};

})(angular, window);
