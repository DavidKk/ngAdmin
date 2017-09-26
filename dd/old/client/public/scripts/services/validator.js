/**
 * validator 验证服务
 * @author David Jones
 * @email  qowera@qq.com
 */
angular.module('services.validator', [])

.provider('$validator', [
  function() {
    var $verification = [];    
    this.add = function(name, validateFn) {
      $verification[name] = validateFn;
    };

    this.$get = function() {
      return $verification;
    };


    // Commons
    // ========================

    /**
     * emial 验证邮箱
     * @param  {String}         email 邮箱地址
     * @return {String|Boolean}       验证通过返回 TRUE，否则返回错误 TOKEN
     */
    $verification.email = function(email) {
      return /^([a-z0-9\+\_\-]+)(\.[a-z0-9\+\_\-]+)*@([a-z0-9\-]+\.)+[a-z]{2,6}$/.test(email) || 'regexp';
    };

    /**
     * password 验证密码
     * @param  {String} password 密码
     * @return {Boolean}
     */
    $verification.password = function(password) {
      if (!/^[\s\w\.\,\@\\\|\+\"\'\<\>\?\[\]\-\/\#\!\$\%\^\&\*\;\:\{\}\=\-\_\`\~\(\)]+$/g.test(password)) {
        return 'regexp';
      }

      if (password.length < 6) {
        return 'length';
      }

      return true;
    };

    /**
     * phone 验证手机号号码
     * @param  {String}   phone 手机号码
     * @return {Boolean}
     */
    $verification.phone = function(phone) {
      return /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1})|(17[0-9]{1})|(14[0-9]{1}))+\d{8})$/.test(phone) || 'regexp';
    };

    /**
     * phone 验证固定电话号码
     * @param  {String}   telephone 固话号码
     * @return {Boolean}
     */
    $verification.telephone = function(telephone) {
      return /^(?:(?:0\d{2,3})-)?(?:\d{7,8})(-(?:\d{3,}))?$/.test(phone) || 'regexp';
    };

    /**
     * phone 联系电话 可能为手机或固话
     * @param  {String}   phone 手机或固话
     * @return {Boolean}
     */
    $verification.contactphone = function(phone) {
      return true === $verification.phone(phone) || true === $verification.telephone(phone) || 'regexp';
    };

    /**
     * number 判断是否为数字
     * @param  {String}   number 数字
     * @return {Boolean}
     */
    $verification.number = function(number) {
      return /^[0-9]+$/.test('' + number) || 'regexp';
    };

    /**
     * time 判断是否为时间
     * @param  {String}   time 时间
     * @return {Boolean}
     */
    $verification.time = function(time) {
      return /^[0-9]{1,2}:[0-9]{1,2}/.test(time) || 'regexp';
    };

    /**
     * word 判断是否不存在字符
     * @param  {String}   word 单词
     * @return {Boolean}
     */
    $verification.word = function(word) {
      return /^[\u4E00-\uFA29a-zA-Z]+/.test(word) || 'regexp';
    };
  }
])

.provider('$ajaxValidator', [
  function() {
    var $verification = {};
    this.add = function(name, validateFn) {
      $verification[name] = validateFn;
    };

    this.$get = function() {
      return $verification;
    };
  }
])

.directive('validator', [
  '$validator', '$ajaxValidator',
  function($validator, $ajaxValidator) {'use strict';
    return {
      require: '^ngModel',
      scope: {
        value: '=?ngModel',
        equalValue: '=?equal',
        noequalValue: '=?noequal'
      },
      link: function($scope, $element, $attrs, ModelCtrl) {
        var validity = ['required', 'equal', 'noequal', 'ajax'],
            ngModel = $attrs.hasOwnProperty('ngModel') ? $attrs.ngModel : undefined,
            required = $attrs.hasOwnProperty('required'),
            equal = $attrs.hasOwnProperty('equal') ? $attrs.equal : undefined,
            noequal = $attrs.hasOwnProperty('noequal') ? $attrs.noequal : undefined,
            type = $attrs.hasOwnProperty('ngType') ? $attrs.ngType : undefined,
            validateFn = $validator[type],
            validateAjaxFn = $ajaxValidator[type],
            UPDATE_DIRTY = 'validator.dirty.' + ngModel,
            UPDATE_FOCUS = 'validator.focus.' + ngModel;

        // listen value changed
        ModelCtrl
        .$parsers
        .unshift(function(viewValue) {
          $scope.$parent.$broadcast(UPDATE_DIRTY, true);
          
          angular.forEach(validity, function(name) {
            ModelCtrl.$setValidity(name, true);
          });

          var valid = validate(viewValue);
          if (true !== valid) {
            -1 === angular.inArray(valid, validity) && validity.push(valid);
            ModelCtrl.$setValidity(valid, false);
          }

          return true === valid ? viewValue : required ? '' : undefined;
        });

        $element
        .on('focus', function() {
          $scope.$parent.$broadcast(UPDATE_FOCUS, true);
        })
        .on('blur', function() {
          var valid = validate(ModelCtrl.$viewValue);
          if (true === valid && angular.isFunction(validateAjaxFn)) {
            validateAjaxFn(ModelCtrl.$viewValue)
            .catch(function() {
              ModelCtrl.$setValidity('ajax', false);
            });
          }

          $scope.$parent.$broadcast(UPDATE_FOCUS, false);
        });

        /**
         * 因为多个相同的 ngModel，angular 会将最后的 ngModel 覆盖，而前面所有的
         * ngModel 均被保存在该 directive 中，对表单中的属性无任何影响作用，
         * 只有 value 和 $invalid 会同步 $dirty 等不会同步过来，
         * 因此这里使用广播使得多个 ngModel 对象相同
         */
        if (ngModel) {
          $scope.$on(UPDATE_DIRTY, function(event, isDrity) {
            isDrity = !!isDrity;
            isDrity !== ModelCtrl.$dirty && ModelCtrl.$setDirty(isDrity);
          });

          $scope.$on(UPDATE_FOCUS, function(event, isFocus) {
            isFocus = !!isFocus;
            if (isFocus !== ModelCtrl.$focus) {
              $scope.$apply(function() {
                ModelCtrl.$focus = isFocus;
              });
            }
          });
        }

        if ($scope.hasOwnProperty('equalValue') || $scope.hasOwnProperty('noequalValue')) {
          $scope.$watch('equalValue + noequalValue', function() {
            ModelCtrl.$validate();
          });
        }

        function validate(value) {
          if (required && '' === value) {
            return 'required';
          }

          if (equal && value !== $scope.equalValue) {
            return 'equal';
          }

          if (noequal && value === $scope.noequalValue) {
            return 'noequal';
          }

          if (!required && '' === value) {
            return true;
          }

          var valid;
          if (angular.isFunction(validateFn) && (valid = validateFn(value))) {
            return valid;
          }

          return true;
        }
      }
    };
  }
])
