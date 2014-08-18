

angular.module('ngValidate', [
  'config', 'ngHelper'
])

.service('$validate', [
  function() {'use strict';
    function isImage(filename, allowType) {
      allowType = $.isArray(allowType) ? allowType : ['JPG', 'JPEG', 'GIF', 'PNG', 'APNG', 'BMP']; 
      var ext = getFileExt(filename);
      return -1 !== $.inArray(ext, allowType);
    }

    function isEn(str) {
      var reg = /^[a-zA-Z]+$/ig;
      return reg.test(str);
    }

    function isCh(str) {
      var reg = /^[\u4E00-\uFA29]+$/ig;
      return reg.test(str);
    }

    function getFileExt(filename) {
      var extStart  = filename.lastIndexOf('.') + 1;
      return filename.substring(extStart, filename.length).toUpperCase();
    }

    function getLen(str) {
      var ch = getChLen(str);
      var en = getLenInEn(str);
      return ch + en;
    }

    function getLenInEn(str) {
      var mh = str.match(/[A-Za-z0-9]/ig);
      return mh ? mh.length : 0;
    }
    function getLenInCh(str) {
      var len = getLen(str);
      return Math.ceil(len/2);
    }

    function getEnLen(str) {
      var mh = str.match(/[a-zA-Z]/ig);
      return mh ? mh.length : 0;
    }

    function getChLen(str) {
      var mh = str.match(/[\u4E00-\uFA29]/ig);
      return mh ? mh.length * 2 : 0;
    }

    function getNumLen(str) {
      var mh = str.match(/[0-9]/ig);
      return mh ? mh.length : 0;
    }

    function toNumber(str) {
      var num = Number(str);
      return isNaN(num) ? 0 : num;
    }

    return {
      validateUsername: function(username) {
        return username ? true : 'require';
      },
      validateEmail: function(email) {
        if (! /^([a-z0-9\+\_\-]+)(\.[a-z0-9\+\_\-]+)*@([a-z0-9\-]+\.)+[a-z]{2,6}$/.test(email)) return 'regexp';
        return true;
      },
      validatePassword: function(password) {
        if (! /^[\s\w\.\,\@\\\|\+\"\'\<\>\?\[\]\-\/\#\!\$\%\^\&\*\;\:\{\}\=\-\_\`\~\(\)]+$/g.test(password)) return 'regexp';
        if (password.length < 6) return 'length';
        return true;
      },
      validateNickname: function(nickname) {
        if (! /^[^0-9][\u4E00-\uFA29a-zA-Z0-9-_]+$/g.test(nickname)) return 'regexp';
        return true;
      },
      validatePhone: function(phone) {
        if (! /^(1(([35][0-9])|(47)|[8][01236789]))\d{8}$/.test(phone)) return 'regexp';
        return true;
      },
      validateCaptcha: function(captcha) {
        if (! /^[0-9a-zA-Z]{3,8}$/.test(captcha)) return 'regexp';
        return true;
      },
      validateConsignee: function(consignee) {
        if (! /^[\u4E00-\uFA29]+$/g.test(consignee)) return 'regexp';

        var length = getLenInCh(consignee);
        if (2 > length || length > 6) return 'length';
        return true;
      },
      validateAddress: function(address) {
        var length = getLenInCh(address);
        if (length > 50) return 'length';
        return true;
      },
      validateFloor: function(floor) {
        if (! /^[0-9]+$/g.test(floor)) return 'regexp';

        floor = Number(floor);
        if (1 > floor || floor > 999) return 'length';
        return true;
      }
    };
  }
])

.directive('validate', [
  '$q',
  function($q) {'use strict';
    return {
      controller: function($scope) {
        // invalid = { true: 'valid', false: 'invalid' }
        this.validity = ['invalid'];
        this.validate = function() {};
      },
      require: ['^validate', '^ngModel'],
      link: function($scope, $element, $attrs, ctrls) {
        var validCtrl = ctrls[0],
        modelCtrl = ctrls[1],
        equal = $attrs['equal'] || undefined,
        noequal = $attrs['noequal'] || undefined;

        if (modelCtrl.$pristine) {
          if (!$attrs.required && modelCtrl.$invalid) setValidity('invalid', true);
          else setValidity('invalid', false);
        }

        function setValidity(key, value) {
          if (-1 === angular.inArray(key, validCtrl.validity)) {
            validCtrl.validity.push(key);
          }

          // reset all items, every item are valid.
          angular.forEach(validCtrl.validity, function(index) {
            if (index !== key && index !== 'invalid') modelCtrl.$setValidity(index, true);
          });

          // set item status to valid
          if (key !== 'invalid' && value === false) modelCtrl.$setValidity('invalid', false);
          modelCtrl.$setValidity(key, value);
        }

        function validate(value) {
          var deferred = $q.defer();
          if ($attrs.required && value === '') setValidity('required', false);
          else if (angular.isDefined(equal) && value !== $scope[equal]) setValidity('equal', false);
          else if (angular.isDefined(noequal) && value === $scope[noequal]) setValidity('noequal', false);
          else setValidity('invalid', true);

          if (modelCtrl.$error.invalid === true && angular.isFunction(deferred.reslove)) deferred.reslove();
          else if (angular.isFunction(deferred.reject)) deferred.reject();

          return deferred.promise;
        }

        modelCtrl.$parsers.unshift(function(value) {
          var valid = validCtrl.validate(true),
          bValid = true === valid;

          if (bValid === true) validate(value);
          else setValidity(valid, bValid);

          return bValid ? value : undefined;
        });

        $element.on('focus', function() {
          $scope.$apply(function() {
            modelCtrl.$focus = true;
          });
        });

        $element.on('blur', function() {
          var valid_or_promise = validCtrl.validate();
          $scope.$apply(function() {
            // sync on blur
            if (angular.isObject(valid_or_promise)) {
              validate(modelCtrl.$modelValue).
              then(function() {
                valid_or_promise.then(function(valid_or_invalid) {
                  if (valid_or_invalid === true) setValidity('invalid', true);
                  else setValidity(valid_or_invalid, false);
                });
              });
            }
            else {
              var bValid = true === valid_or_promise;
              if (bValid === true) validate(modelCtrl.$modelValue);
              else setValidity(valid_or_promise, bValid);
            }

            modelCtrl.$focus = false;
            modelCtrl.$note = true;
          });
        });

        modelCtrl.validate = function(hasScope) {
          var valid = validCtrl.validate(true),
          bValid = true === valid;
          modelCtrl.$note = true;

          if (hasScope === true) {
            if (bValid === true) validate(modelCtrl.$modelValue);
            else setValidity(valid, bValid);
          }
          else {
            $scope.$apply(function() {
              if (bValid === true) validate(modelCtrl.$modelValue);
              else setValidity(valid, bValid);
            });
          }
        };
      }
    };
  }
])

.directive('addressValidate', [
  '$q', '$http',
  '$validate',
  function($q, Runtime, validate) {'use strict';
    return {
      require: ['^validate', '^ngModel'],
      link: function($scope, $element, $attrs, ctrls) {
        var validCtrl = ctrls[0];

        validCtrl.validate = function() {
          var address = $element.val();
          return validate.validateAddress(address);
        };
      }
    };
  }
])

.directive('usernameValidate', [
  '$q', '$http',
  '$validate',
  function($q, Runtime, validate) {'use strict';
    return {
      require: ['^validate', '^ngModel'],
      link: function($scope, $element, $attrs, ctrls) {
        var validCtrl = ctrls[0];

        validCtrl.validate = function() {
          var username = $element.val();
          return validate.validateUsername(username);
        };
      }
    };
  }
])

.directive('floorValidate', [
  '$q', '$http',
  '$validate',
  function($q, Runtime, validate) {'use strict';
    return {
      require: ['^validate', '^ngModel'],
      link: function($scope, $element, $attrs, ctrls) {
        var validCtrl = ctrls[0];

        validCtrl.validate = function() {
          var floor = $element.val();
          return validate.validateFloor(floor);
        };
      }
    };
  }
])

.directive('captchaValidate', [
  '$q', '$http',
  '$validate',
  function($q, Runtime, validate) {'use strict';
    return {
      require: ['^validate', '^ngModel'],
      link: function($scope, $element, $attrs, ctrls) {
        var validCtrl = ctrls[0];

        validCtrl.validate = function(request) {
          var captcha = $element.val();
          return validate.validateCaptcha(captcha);
        };
      }
    };
  }
])

.directive('consigneeValidate', [
  '$q', '$http',
  '$validate',
  function($q, Runtime, validate) {'use strict';
    return {
      require: ['^validate', '^ngModel'],
      link: function($scope, $element, $attrs, ctrls) {
        var validCtrl = ctrls[0];

        validCtrl.validate = function(request) {
          var consignee = $element.val();
          return validate.validateConsignee(consignee);
        };
      }
    };
  }
])

.directive('emailValidate', [
  '$q', '$http',
  '$validate',
  function($q, Runtime, validate) {'use strict';
    return {
      require: ['^validate', '^ngModel'],
      link: function($scope, $element, $attrs, ctrls) {
        var validCtrl = ctrls[0];

        validCtrl.validate = function(request) {
          var email = $element.val(),
          valid = validate.validateEmail(email);

          if (true !== valid || request === true) return valid;

          var deferred = $q.defer();
          // Runtime.sendMessage({ request: 'GET:user/exists/', data: { email: email } }, function(oRes) {
          //   deferred.resolve(oRes.exists);
          // });

          deferred.resolve(true);
          return deferred.promise;
        };
      }
    };
  }
])

.directive('passwordValidate', [
  '$validate',
  function($validate) {'use strict';
    return {
      require: ['^validate', '^ngModel'],
      link: function($scope, $element, $attrs, ctrls) {
        var validCtrl = ctrls[0];

        validCtrl.validate = function() {
          var password = $element.val();
          return validate.validatePassword(password);
        };
      }
    };
  }
])

.directive('phoneValidate', [
  '$validate',
  function($validate) {'use strict';
    return {
      require: ['^validate', '^ngModel'],
      link: function($scope, $element, $attrs, ctrls) {
        var validCtrl = ctrls[0];

        validCtrl.validate = function() {
          var phone = $element.val();
          return validate.validatePhone(phone);
        };
      }
    };
  }
])