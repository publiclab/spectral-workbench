/*!
    * Steps v1.1.1
    * https://github.com/oguzhanoya/jquery-steps
    *
    * Copyright (c) 2020 oguzhanoya
    * Released under the MIT license
    */
    
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('jquery')) :
  typeof define === 'function' && define.amd ? define(['jquery'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.$));
}(this, (function ($$1) { 'use strict';

  function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

  var $__default = /*#__PURE__*/_interopDefaultLegacy($$1);

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  var DEFAULTS = {
    startAt: 0,
    showBackButton: true,
    showFooterButtons: true,
    onInit: $.noop,
    onDestroy: $.noop,
    onFinish: $.noop,
    onChange: function onChange() {
      return true;
    },
    stepSelector: '.step-steps',
    contentSelector: '.step-content',
    footerSelector: '.step-footer',
    activeClass: 'active',
    doneClass: 'done',
    errorClass: 'error'
  };

  var Steps = /*#__PURE__*/function () {
    function Steps(element, options) {
      _classCallCheck(this, Steps);

      // Extend defaults with the init options.
      this.options = $__default['default'].extend({}, DEFAULTS, options); // Store main DOM element.

      this.el = $__default['default'](element);
      this.stepSelector = "".concat(this.options.stepSelector, " [data-step-target]");
      this.footerSelector = "".concat(this.options.footerSelector, " [data-step-action]");
      this.contentSelector = "".concat(this.options.contentSelector, " [data-step]"); // Initialize

      this.init();
    }

    _createClass(Steps, [{
      key: "stepClick",
      value: function stepClick(e) {
        e.preventDefault();
        var nextStep = $__default['default'](this).closest('[data-step-target]').index();
        var stepIndex = e.data.self.getStepIndex();
        e.data.self.setActiveStep(stepIndex, nextStep);
      }
    }, {
      key: "btnClick",
      value: function btnClick(e) {
        e.preventDefault();
        var statusAction = $__default['default'](this).data('step-action');
        e.data.self.setAction(statusAction);
      }
    }, {
      key: "init",
      value: function init() {
        this.hook('onInit');
        var self = this; // step click event

        $__default['default'](this.el).find(this.stepSelector).on('click', {
          self: self
        }, this.stepClick); // button click event

        $__default['default'](this.el).find(this.footerSelector).on('click', {
          self: self
        }, this.btnClick); // set default step

        this.setActiveStep(0, this.options.startAt, true);
        this.setFooterBtns(); // show footer buttons

        if (!this.options.showFooterButtons) {
          this.hideFooterBtns();
          this.setFooterBtns = $__default['default'].noop;
        }
      }
    }, {
      key: "hook",
      value: function hook(hookName) {
        if (this.options[hookName] !== undefined) {
          this.options[hookName].call(this.el);
        }
      }
    }, {
      key: "destroy",
      value: function destroy() {
        this.hook('onDestroy');
        $__default['default'](this.el).find(this.stepSelector).off('click');
        $__default['default'](this.el).find(this.footerSelector).off('click');
        this.el.removeData('plugin_Steps');
        this.el.remove();
      }
    }, {
      key: "getStepIndex",
      value: function getStepIndex() {
        var stepIndex = this.el.find(this.stepSelector).filter(".".concat(this.options.activeClass.split(' ').join('.'))).index();
        return stepIndex || 0;
      }
    }, {
      key: "getMaxStepIndex",
      value: function getMaxStepIndex() {
        return this.el.find(this.stepSelector).length - 1;
      }
    }, {
      key: "getStepDirection",
      value: function getStepDirection(stepIndex, newIndex) {
        var direction = 'none';

        if (newIndex < stepIndex) {
          direction = 'backward';
        } else if (newIndex > stepIndex) {
          direction = 'forward';
        }

        return direction;
      }
    }, {
      key: "setShowStep",
      value: function setShowStep(idx, removeClass) {
        var addClass = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';
        var $targetStep = this.el.find(this.stepSelector).eq(idx);
        $targetStep.removeClass(removeClass).addClass(addClass);
        var $tabContent = this.el.find(this.contentSelector);
        $tabContent.removeClass(this.options.activeClass).eq(idx).addClass(this.options.activeClass);
      }
    }, {
      key: "setActiveStep",
      value: function setActiveStep(currentIndex, newIndex) {
        var init = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

        if (newIndex !== currentIndex || init) {
          var conditionDirection = newIndex > currentIndex ? function (start) {
            return start <= newIndex;
          } : function (start) {
            return start >= newIndex;
          };
          var conditionIncrementOrDecrement = newIndex > currentIndex ? function (start) {
            var s = start;
            s += 1;
            return s;
          } : function (start) {
            var s = start;
            s -= 1;
            return s;
          };
          var i = currentIndex;

          while (conditionDirection(i)) {
            var stepDirection = this.getStepDirection(i, newIndex);

            if (i === newIndex) {
              this.setShowStep(i, this.options.doneClass, this.options.activeClass);
            } else {
              var checkDone = stepDirection === 'forward' && this.options.doneClass;
              this.setShowStep(i, "".concat(this.options.activeClass, " ").concat(this.options.errorClass, " ").concat(this.options.doneClass), checkDone);
            }

            var validStep = this.options.onChange(i, newIndex, stepDirection);

            if (!validStep) {
              this.setShowStep(i, this.options.doneClass, "".concat(this.options.activeClass, " ").concat(this.options.errorClass));
              i = newIndex;
            }

            i = conditionIncrementOrDecrement(i);
          }

          this.setFooterBtns();
        }
      }
    }, {
      key: "setFooterBtns",
      value: function setFooterBtns() {
        var stepIndex = this.getStepIndex();
        var maxIndex = this.getMaxStepIndex();
        var $footer = this.el.find(this.options.footerSelector);

        if (stepIndex === 0) {
          $footer.find('[data-step-action="prev"]').hide();
        }

        if (stepIndex > 0 && this.options.showBackButton) {
          $footer.find('[data-step-action="prev"]').show();
        }

        if (maxIndex === stepIndex) {
          $footer.find('[data-step-action="prev"]').show();
          $footer.find('[data-step-action="next"]').hide();
          $footer.find('[data-step-action="finish"]').show();
        } else {
          $footer.find('[data-step-action="next"]').show();
          $footer.find('[data-step-action="finish"]').hide();
        }

        if (!this.options.showBackButton) {
          $footer.find('[data-step-action="prev"]').hide();
        }
      }
    }, {
      key: "setAction",
      value: function setAction(action) {
        var stepIndex = this.getStepIndex();
        var nextStep = stepIndex;

        if (action === 'prev') {
          nextStep -= 1;
        }

        if (action === 'next') {
          nextStep += 1;
        }

        if (action === 'finish') {
          var validStep = this.options.onChange(stepIndex, nextStep, 'forward');

          if (validStep) {
            this.hook('onFinish');
          } else {
            this.setShowStep(stepIndex, '', this.options.errorClass);
          }
        } else {
          this.setActiveStep(stepIndex, nextStep);
        }
      }
    }, {
      key: "setStepIndex",
      value: function setStepIndex(idx) {
        var maxIndex = this.getMaxStepIndex();

        if (idx <= maxIndex) {
          var stepIndex = this.getStepIndex();
          this.setActiveStep(stepIndex, idx);
        }
      }
    }, {
      key: "next",
      value: function next() {
        var stepIndex = this.getStepIndex();
        var maxIndex = this.getMaxStepIndex();
        return maxIndex === stepIndex ? this.setAction('finish') : this.setAction('next');
      }
    }, {
      key: "prev",
      value: function prev() {
        var stepIndex = this.getStepIndex();
        return stepIndex !== 0 && this.setAction('prev');
      }
    }, {
      key: "finish",
      value: function finish() {
        this.hook('onFinish');
      }
    }, {
      key: "hideFooterBtns",
      value: function hideFooterBtns() {
        this.el.find(this.options.footerSelector).hide();
      }
    }], [{
      key: "setDefaults",
      value: function setDefaults(options) {
        $__default['default'].extend(DEFAULTS, $__default['default'].isPlainObject(options) && options);
      }
    }]);

    return Steps;
  }();

  var version = "1.1.1";

  var other = $__default['default'].fn.steps;

  $__default['default'].fn.steps = function (options) {
    return this.each(function () {
      if (!$__default['default'].data(this, 'plugin_Steps')) {
        $__default['default'].data(this, 'plugin_Steps', new Steps(this, options));
      }
    });
  };

  $__default['default'].fn.steps.version = version;
  $__default['default'].fn.steps.setDefaults = Steps.setDefaults; // No conflict

  $__default['default'].fn.steps.noConflict = function () {
    $__default['default'].fn.steps = other;
    return this;
  };

})));
//# sourceMappingURL=jquery-steps.js.map
