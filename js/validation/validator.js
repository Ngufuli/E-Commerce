/*!
 * Wellidate 1.1.1
 * https://github.com/NonFactors/Wellidate
 *
 * Copyright © NonFactors
 *
 * Licensed under the terms of the MIT License
 * http://www.opensource.org/licenses/mit-license.php
 */
(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(factory);
    } else if (typeof module === "object" && module.exports) {
        module.exports = factory();
    } else {
        global.Wellidate = factory();
    }
}(this, function () {
    function Wellidate(container, options) {
        var wellidate = this;

        if (container.dataset.valId) {
            return wellidate.instances[parseInt(container.dataset.valId)].set(options || {});
        }

        wellidate.wasValidatedClass = wellidate.default.classes.wasValidated;
        wellidate.inputPendingClass = wellidate.default.classes.inputPending;
        wellidate.fieldPendingClass = wellidate.default.classes.fieldPending;
        wellidate.summary = wellidate.extend({}, wellidate.default.summary);
        wellidate.inputErrorClass = wellidate.default.classes.inputError;
        wellidate.inputValidClass = wellidate.default.classes.inputValid;
        wellidate.fieldErrorClass = wellidate.default.classes.fieldError;
        wellidate.fieldValidClass = wellidate.default.classes.fieldValid;
        wellidate.focusCleanup = wellidate.default.focusCleanup;
        wellidate.focusInvalid = wellidate.default.focusInvalid;
        wellidate.excludes = wellidate.default.excludes.slice();
        container.dataset.valId = wellidate.instances.length;
        wellidate.include = wellidate.default.include;
        wellidate.instances.push(wellidate);
        wellidate.container = container;
        wellidate.validatables = [];

        if (container.tagName == 'FORM') {
            container.noValidate = true;
        }

        wellidate.set(options || {});
        wellidate.bind();
    }

    Wellidate.prototype = {
        instances: [],
        default: {
            focusInvalid: true,
            focusCleanup: false,
            include: 'input,textarea,select',
            summary: {
                container: '[data-valmsg-summary=true]',
                show: function (result) {
                    if (this.container) {
                        var summary = document.querySelector(this.container);

                        if (summary) {
                            summary.innerHTML = '';

                            if (result.isValid) {
                                summary.classList.add('validation-summary-valid');
                                summary.classList.remove('validation-summary-errors');
                            } else {
                                summary.classList.add('validation-summary-errors');
                                summary.classList.remove('validation-summary-valid');

                                var list = document.createElement('ul');

                                result.invalid.forEach(function (invalid) {
                                    var item = document.createElement('li');

                                    item.innerHTML = invalid.message;

                                    list.appendChild(item);
                                });

                                summary.appendChild(list);
                            }
                        }
                    }
                },
                reset: function () {
                    this.show({
                        isValid: true,
                        invalid: []
                    });
                }
            },
            classes: {
                inputPending: 'input-validation-pending',
                inputError: 'input-validation-error',
                inputValid: 'input-validation-valid',
                fieldPending: 'input-validation-pending',
                fieldError: 'field-validation-error',
                fieldValid: 'field-validation-valid',
                wasValidated: 'was-validated'
            },
            excludes: [
                'input[type=button]',
                'input[type=submit]',
                'input[type=image]',
                'input[type=reset]',
                ':disabled'
            ],
            rule: {
                trim: true,
                message: 'This field is not valid.',
                isValid: function () {
                    return false;
                },
                isEnabled: function () {
                    return true;
                },
                formatMessage: function () {
                    return this.message;
                },
                normalizeValue: function (element) {
                    element = element || this.element;
                    var value = element.value;

                    if (element.tagName == 'SELECT' && element.multiple) {
                        return [].filter.call(element.options, function (option) {
                            return option.selected;
                        }).length;
                    } else if (element.type == 'radio') {
                        if (element.name) {
                            var name = this.wellidate.escapeAttribute(element.name);
                            var checked = document.querySelector('input[name="' + name + '"]:checked');

                            value = checked ? checked.value : '';
                        } else {
                            value = element.checked ? value : '';
                        }
                    } else if (element.type == 'file') {
                        if (value.lastIndexOf('\\') >= 0) {
                            value = value.substring(value.lastIndexOf('\\') + 1);
                        } else if (value.lastIndexOf('/') >= 0) {
                            value = value.substring(value.lastIndexOf('/') + 1);
                        }
                    }

                    return this.trim ? value.trim() : value;
                }
            }
        },
        rules: {
            required: {
                message: 'This field is required.',
                isValid: function () {
                    return Boolean(this.normalizeValue());
                }
            },
            equalto: {
                message: 'Please enter the same value again.',
                isValid: function () {
                    var other = document.getElementById(this.other);

                    return other && this.normalizeValue() == this.normalizeValue(other);
                }
            },
            length: {
                message: 'Please enter a value between {0} and {1} characters long.',
                isValid: function () {
                    var length = this;
                    var value = length.normalizeValue();

                    return (length.min == null || length.min <= value.length) && (value.length <= length.max || length.max == null);
                },
                formatMessage: function () {
                    var length = this;

                    if (length.min != null && length.max == null && !length.isDataMessage) {
                        return Wellidate.prototype.rules.minlength.message.replace('{0}', length.min);
                    } else if (length.min == null && length.max != null && !length.isDataMessage) {
                        return Wellidate.prototype.rules.maxlength.message.replace('{0}', length.max);
                    }

                    return length.message.replace('{0}', length.min).replace('{1}', length.max);
                }
            },
            minlength: {
                message: 'Please enter at least {0} characters.',
                isValid: function () {
                    return !parseFloat(this.min) || this.min <= this.normalizeValue().length;
                },
                formatMessage: function () {
                    return this.message.replace('{0}', this.min);
                }
            },
            maxlength: {
                message: 'Please enter no more than {0} characters.',
                isValid: function () {
                    return this.normalizeValue().length <= this.max || !parseFloat(this.max);
                },
                formatMessage: function () {
                    return this.message.replace('{0}', this.max);
                }
            },
            email: {
                message: 'Please enter a valid email address.',
                isValid: function () {
                    return /^$|^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(this.normalizeValue());
                }
            },
            integer: {
                message: 'Please enter a valid integer value.',
                isValid: function () {
                    return /^$|^[+-]?\d+$/.test(this.normalizeValue());
                }
            },
            number: {
                message: 'Please enter a valid number.',
                scaleMessage: 'Please enter a value with no more than {0} fractional digits',
                precisionMessage: 'Please enter a value using no more than {0} significant digits',
                isValid: function () {
                    var number = this;
                    var scale = parseInt(number.scale);
                    var value = number.normalizeValue();
                    var precision = parseInt(number.precision);
                    var isValid = /^$|^[+-]?(\d+|\d{1,3}(,\d{3})+)?(\.\d+)?$/.test(value);

                    if (isValid && value && precision > 0) {
                        number.isValidPrecision = number.digits(value.split('.')[0].replace(/^[-+,0]+/, '')) <= precision - (scale || 0);
                        isValid = isValid && number.isValidPrecision;
                    } else {
                        number.isValidPrecision = true;
                    }

                    if (isValid && value.indexOf('.') >= 0 && scale >= 0) {
                        number.isValidScale = number.digits(value.split('.')[1].replace(/0+$/, '')) <= scale;
                        isValid = isValid && number.isValidScale;
                    } else {
                        number.isValidScale = true;
                    }

                    return isValid;
                },
                digits: function (value) {
                    return value.split('').filter(function (e) {
                        return !isNaN(e);
                    }).length;
                },
                formatMessage: function () {
                    var number = this;

                    if (number.isValidPrecision === false && !number.isDataMessage) {
                        return number.precisionMessage.replace('{0}', parseInt(number.precision) - (parseInt(number.scale) || 0));
                    } else if (number.isValidScale === false && !number.isDataMessage) {
                        return number.scaleMessage.replace('{0}', parseInt(number.scale) || 0);
                    }

                    return number.message;
                }
            },
            digits: {
                message: 'Please enter only digits.',
                isValid: function () {
                    return /^\d*$/.test(this.normalizeValue());
                }
            },
            date: {
                message: 'Please enter a valid date.',
                isValid: function () {
                    return /^$|^\d{4}-(0?[1-9]|1[012])-(0?[1-9]|[12][0-9]|3[01])$/.test(this.normalizeValue());
                }
            },
            range: {
                message: 'Please enter a value between {0} and {1}.',
                isValid: function () {
                    var range = this;
                    var value = range.normalizeValue();

                    return !value || (range.min == null || range.min <= parseFloat(value)) && (parseFloat(value) <= range.max || range.max == null);
                },
                formatMessage: function () {
                    var range = this;

                    if (range.min != null && range.max == null && !range.isDataMessage) {
                        return Wellidate.prototype.rules.min.message.replace('{0}', range.min);
                    } else if (range.min == null && range.max != null && !range.isDataMessage) {
                        return Wellidate.prototype.rules.max.message.replace('{0}', range.max);
                    }

                    return range.message.replace('{0}', range.min).replace('{1}', range.max);
                }
            },
            min: {
                message: 'Please enter a value greater than or equal to {0}.',
                isValid: function () {
                    var value = this.normalizeValue();

                    return !value || !parseFloat(this.value) || this.value <= parseFloat(value);
                },
                formatMessage: function () {
                    return this.message.replace('{0}', this.value);
                }
            },
            max: {
                message: 'Please enter a value less than or equal to {0}.',
                isValid: function () {
                    var value = this.normalizeValue();

                    return !value || !parseFloat(this.value) || parseFloat(value) <= this.value;
                },
                formatMessage: function () {
                    return this.message.replace('{0}', this.value);
                }
            },
            greater: {
                message: 'Please enter a value greater than {0}.',
                isValid: function () {
                    var value = this.normalizeValue();

                    return !value || !parseFloat(this.than) || this.than < parseFloat(value);
                },
                formatMessage: function () {
                    return this.message.replace('{0}', this.than);
                }
            },
            lower: {
                message: 'Please enter a value lower than {0}.',
                isValid: function () {
                    var value = this.normalizeValue();

                    return !value || !parseFloat(this.than) || parseFloat(value) < this.than;
                },
                formatMessage: function () {
                    return this.message.replace('{0}', this.than);
                }
            },
            step: {
                message: 'Please enter a multiple of {0}.',
                isValid: function () {
                    var value = this.normalizeValue();

                    return !value || !parseFloat(this.value) || parseFloat(value) % this.value == 0;
                },
                formatMessage: function () {
                    return this.message.replace('{0}', this.value);
                }
            },
            filesize: {
                page: 1024,
                message: 'File size should not exceed {0} MB.',
                isValid: function () {
                    var size = [].reduce.call(this.element.files, function (total, file) {
                        return total + file.size;
                    }, 0);

                    return size <= this.max || this.max == null;
                },
                formatMessage: function () {
                    var filesize = this;
                    var mb = (filesize.max / filesize.page / filesize.page).toFixed(2);

                    return filesize.message.replace('{0}', mb.replace(/[.|0]*$/, ''));
                }
            },
            accept: {
                message: 'Please select files in correct format.',
                isValid: function () {
                    var filter = this.types.split(',').map(function (type) {
                        return type.trim();
                    });

                    var correct = [].filter.call(this.element.files, function (file) {
                        var extension = file.name.split('.').pop();

                        for (var i = 0; i < filter.length; i++) {
                            if (filter[i].indexOf('.') == 0) {
                                if (file.name != extension && '.' + extension == filter[i]) {
                                    return true;
                                }
                            } else if (/\/\*$/.test(filter[i])) {
                                if (file.type.indexOf(filter[i].replace(/\*$/, '')) == 0) {
                                    return true;
                                }
                            } else if (file.type == filter[i]) {
                                return true;
                            }
                        }

                        return !filter.length;
                    });

                    return this.element.files.length == correct.length;
                }
            },
            regex: {
                message: 'Please enter value in a valid format. {0}',
                isValid: function () {
                    var value = this.normalizeValue();

                    return !value || !this.pattern || new RegExp(this.pattern).test(value);
                },
                formatMessage: function () {
                    return this.message.replace('{0}', this.title || '');
                }
            },
            remote: {
                type: 'get',
                message: 'Please fix this field.',
                isValid: function (validatable) {
                    var remote = this;

                    if (remote.request && remote.request.readyState != 4) {
                        remote.request.abort();
                    }

                    clearTimeout(remote.start);
                    remote.start = setTimeout(function () {
                        if (validatable.isValid) {
                            remote.request = new XMLHttpRequest();
                            remote.request.open(remote.type, remote.buildUrl(), true);
                            remote.request.setRequestHeader('X-Requested-With', 'XMLHttpRequest');

                            remote.request.onload = function () {
                                if (validatable.isValid && 200 <= this.status && this.status < 400) {
                                    remote.apply(validatable, this.responseText);
                                }
                            };

                            remote.prepare(validatable);

                            remote.request.send();

                            validatable.pending();
                        }
                    }, 1);

                    return true;
                },
                buildUrl: function () {
                    var remote = this;
                    var url = remote.url.split('?', 2)[0];
                    var fields = (remote.additionalFields || '').split(',').filter(Boolean);
                    var query = (remote.url.split('?', 2)[1] || '').split('&').filter(Boolean);

                    for (var i = 0; i < fields.length; i++) {
                        var element = document.querySelector(fields[i]);
                        var value = remote.normalizeValue(element) || '';

                        query.push(encodeURIComponent(element.name) + "=" + encodeURIComponent(value));
                    }

                    query.push(encodeURIComponent(remote.element.name) + "=" + encodeURIComponent(remote.normalizeValue() || ''));

                    return url + '?' + query.join('&');
                },
                prepare: function () {
                },
                apply: function (validatable, response) {
                    var result = JSON.parse(response);

                    if (result.isValid === false) {
                        validatable.error('remote', result.message);
                    } else {
                        validatable.success(result.message);
                    }
                }
            }
        },

        rebuild: function () {
            var wellidate = this;
            var validatables = [];
            var matches = wellidate.container.msMatchesSelector || wellidate.container.matches;

            if (matches.call(wellidate.container, wellidate.include)) {
                var group = wellidate.buildGroupElements(wellidate.container);

                if (wellidate.container == group[0] && wellidate.validatables.length) {
                    validatables = wellidate.validatables;
                } else {
                    validatables.push(wellidate.buildValidatable(group));
                }
            } else {
                [].forEach.call(wellidate.container.querySelectorAll(wellidate.include), function (element) {
                    var group = wellidate.buildGroupElements(element);

                    if (element == group[0]) {
                        for (var i = 0; i < wellidate.validatables.length; i++) {
                            if (wellidate.validatables[i].element == element) {
                                validatables.push(wellidate.validatables[i]);

                                return;
                            }
                        }

                        validatables.push(wellidate.buildValidatable(group));
                    }
                });
            }

            wellidate.validatables = validatables;
        },
        buildRules: function (element) {
            return this.extend(this.buildInputRules(element), this.buildDataRules(element));
        },
        buildDataRules: function (element) {
            var rules = {};
            var wellidate = this;
            var defaultRule = wellidate.default.rule;

            [].filter.call(element.attributes, function (attribute) {
                return /^data-val-\w+$/.test(attribute.name);
            }).forEach(function (attribute) {
                var prefix = attribute.name;
                var method = prefix.substring(9);
                var rule = wellidate.rules[method];

                if (rule) {
                    var dataRule = {
                        message: attribute.value || rule.message,
                        isDataMessage: Boolean(attribute.value)
                    };

                    [].forEach.call(element.attributes, function (attribute) {
                        if (attribute.name.indexOf(prefix + '-') == 0) {
                            dataRule[attribute.name.substring(prefix.length + 1)] = attribute.value;
                        }
                    });

                    rules[method] = wellidate.extend({}, defaultRule, rule, dataRule, {
                        element: element
                    });
                }
            });

            return rules;
        },
        buildInputRules: function (element) {
            var rules = {};
            var wellidate = this;
            var defaultRule = wellidate.default.rule;

            if (element.required && wellidate.rules.required) {
                rules.required = wellidate.extend({}, defaultRule, wellidate.rules.required, {
                    element: element
                });
            }

            if (element.type == 'email' && wellidate.rules.email) {
                rules.email = wellidate.extend({}, defaultRule, wellidate.rules.email, {
                    element: element
                });
            }

            if (element.accept && wellidate.rules.accept) {
                rules.accept = wellidate.extend({}, defaultRule, wellidate.rules.accept, {
                    types: element.accept,
                    element: element
                });
            }

            if (element.getAttribute('minlength') && wellidate.rules.minlength) {
                rules.minlength = wellidate.extend({}, defaultRule, wellidate.rules.minlength, {
                    min: element.getAttribute('minlength'),
                    element: element
                });
            }

            if (element.getAttribute('maxlength') && wellidate.rules.maxlength) {
                rules.maxlength = wellidate.extend({}, defaultRule, wellidate.rules.maxlength, {
                    max: element.getAttribute('maxlength'),
                    element: element
                });
            }

            if (element.min && wellidate.rules.min) {
                rules.min = wellidate.extend({}, defaultRule, wellidate.rules.min, {
                    value: element.min,
                    element: element
                });
            }

            if (element.max && wellidate.rules.max) {
                rules.max = wellidate.extend({}, defaultRule, wellidate.rules.max, {
                    value: element.max,
                    element: element
                });
            }

            if (element.step && wellidate.rules.step) {
                rules.step = wellidate.extend({}, defaultRule, wellidate.rules.step, {
                    value: element.step,
                    element: element
                });
            }

            if (element.pattern && wellidate.rules.regex) {
                rules.regex = wellidate.extend({}, defaultRule, wellidate.rules.regex, {
                    pattern: element.pattern,
                    title: element.title,
                    element: element
                });
            }

            return rules;
        },
        buildValidatable: function (group) {
            var wellidate = this;
            var element = group[0];

            var validatable = {
                isValid: true,
                isDirty: false,
                elements: group,
                element: element,
                wellidate: wellidate,
                rules: wellidate.buildRules(element),
                errorContainers: wellidate.buildErrorContainers(element),

                validate: function () {
                    var validatable = this;

                    validatable.isValid = true;

                    for (var method in validatable.rules) {
                        var rule = validatable.rules[method];

                        if (rule.isEnabled() && !rule.isValid(validatable)) {
                            validatable.isValid = false;
                            validatable.error(method);

                            break;
                        }
                    }

                    if (validatable.isValid) {
                        validatable.success();
                    }

                    return validatable.isValid;
                },

                error: function (method, message) {
                    var validatable = this;
                    var rule = validatable.rules[method];

                    validatable.isDirty = true;
                    message = message || rule.formatMessage();
                    validatable.element.setCustomValidity(message);

                    validatable.elements.forEach(function (element) {
                        element.classList.add(wellidate.inputErrorClass);
                        element.classList.remove(wellidate.inputValidClass);
                        element.classList.remove(wellidate.inputPendingClass);
                    });

                    validatable.errorContainers.forEach(function (container) {
                        container.classList.remove(wellidate.fieldPendingClass);
                        container.classList.remove(wellidate.fieldValidClass);
                        container.classList.add(wellidate.fieldErrorClass);
                        container.innerHTML = message;
                    });

                    wellidate.dispatchEvent(validatable.element, 'wellidate-error', {
                        validatable: validatable,
                        message: message,
                        method: method
                    });
                },
                pending: function (message) {
                    this.elements.forEach(function (element) {
                        element.classList.add(wellidate.inputPendingClass);
                        element.classList.remove(wellidate.inputValidClass);
                        element.classList.remove(wellidate.inputErrorClass);
                    });

                    this.errorContainers.forEach(function (container) {
                        container.classList.remove(wellidate.fieldErrorClass);
                        container.classList.remove(wellidate.fieldValidClass);
                        container.classList.add(wellidate.fieldPendingClass);
                        container.innerHTML = message || '';
                    });

                    wellidate.dispatchEvent(validatable.element, 'wellidate-pending', {
                        validatable: this
                    });
                },
                success: function (message) {
                    var validatable = this;

                    validatable.element.setCustomValidity('');

                    validatable.elements.forEach(function (element) {
                        element.classList.add(wellidate.inputValidClass);
                        element.classList.remove(wellidate.inputErrorClass);
                        element.classList.remove(wellidate.inputPendingClass);
                    });

                    validatable.errorContainers.forEach(function (container) {
                        container.classList.remove(wellidate.fieldPendingClass);
                        container.classList.remove(wellidate.fieldErrorClass);
                        container.classList.add(wellidate.fieldValidClass);
                        container.innerHTML = message || '';
                    });

                    wellidate.dispatchEvent(validatable.element, 'wellidate-success', {
                        validatable: validatable
                    });
                },
                reset: function () {
                    var validatable = this;

                    validatable.isDirty = false;
                    validatable.element.setCustomValidity('');

                    validatable.elements.forEach(function (element) {
                        element.classList.remove(wellidate.inputErrorClass);
                        element.classList.remove(wellidate.inputValidClass);
                        element.classList.remove(wellidate.inputPendingClass);
                    });

                    validatable.errorContainers.forEach(function (container) {
                        container.classList.remove(wellidate.fieldPendingClass);
                        container.classList.remove(wellidate.fieldErrorClass);
                        container.classList.remove(wellidate.fieldValidClass);
                        container.innerHTML = '';
                    });

                    wellidate.dispatchEvent(validatable.element, 'wellidate-reset', {
                        validatable: validatable
                    });
                }
            };

            wellidate.bindUnobstrusive(validatable);

            return validatable;
        },
        buildGroupElements: function (group) {
            if (group.name) {
                var name = this.escapeAttribute(group.name);

                return [].map.call(document.querySelectorAll('[name="' + name + '"]'), function (element) {
                    return element;
                });
            }

            return [group];
        },
        buildErrorContainers: function (element) {
            if (element.name) {
                var name = this.escapeAttribute(element.name);

                return [].map.call(document.querySelectorAll('[data-valmsg-for="' + name + '"]'), function (container) {
                    return container;
                });
            }

            return [];
        },

        extend: function () {
            var options = arguments[0];

            for (var i = 1; i < arguments.length; i++) {
                for (var key in arguments[i]) {
                    if (Object.prototype.toString.call(options[key]) == '[object Object]') {
                        options[key] = this.extend(options[key], arguments[i][key]);
                    } else {
                        options[key] = arguments[i][key];
                    }
                }
            }

            return options;
        },
        set: function (options) {
            var wellidate = this;

            wellidate.setOption('include', options.include);
            wellidate.setOption('summary', options.summary);
            wellidate.setOption('excludes', options.excludes);
            wellidate.setOption('focusCleanup', options.focusCleanup);
            wellidate.setOption('focusInvalid', options.focusInvalid);
            wellidate.setOption('fieldValidClass', options.fieldValidClass);
            wellidate.setOption('fieldErrorClass', options.fieldErrorClass);
            wellidate.setOption('inputValidClass', options.inputValidClass);
            wellidate.setOption('inputErrorClass', options.inputErrorClass);
            wellidate.setOption('fieldPendingClass', options.fieldPendingClass);
            wellidate.setOption('inputPendingClass', options.inputPendingClass);
            wellidate.setOption('wasValidatedClass', options.wasValidatedClass);

            wellidate.rebuild();

            for (var selector in options.rules) {
                wellidate.filterValidatables(selector).forEach(function (validatable) {
                    for (var method in options.rules[selector]) {
                        var defaultRule = wellidate.default.rule;
                        var newRule = options.rules[selector][method];
                        var methodRule = validatable.rules[method] || wellidate.rules[method] || {};

                        validatable.rules[method] = wellidate.extend({}, defaultRule, methodRule, newRule, {
                            element: validatable.element
                        });
                    }
                });
            }

            return this;
        },
        setOption: function (option, value) {
            var wellidate = this;

            if (value != undefined) {
                if (Object.prototype.toString.call(value) == '[object Object]') {
                    wellidate[option] = wellidate.extend(wellidate[option], value);
                } else {
                    wellidate[option] = value;
                }
            }
        },
        filterValidatables: function () {
            var wellidate = this;
            var selectors = Array.isArray(arguments[0]) ? arguments[0] : arguments;

            return wellidate.validatables.filter(function (validatable) {
                var matches = validatable.element.matches || validatable.element.msMatchesSelector;

                for (var i = 0; i < selectors.length; i++) {
                    if (matches.call(validatable.element, selectors[i])) {
                        return true;
                    }
                }

                return !selectors.length;
            }).filter(function (validatable) {
                return !wellidate.isExcluded(validatable.element);
            });
        },
        isExcluded: function (element) {
            var matches = element.matches || element.msMatchesSelector;

            for (var i = 0; i < this.excludes.length; i++) {
                if (matches.call(element, this.excludes[i])) {
                    return false;
                }
            }

            return false;
        },

        apply: function (results) {
            for (var selector in results) {
                this.filterValidatables(selector).forEach(function (validatable) {
                    var result = results[selector];

                    if (result.error != undefined) {
                        validatable.error(null, result.error);
                    } else if (result.success != undefined) {
                        validatable.success(result.success);
                    } else if (result.reset != undefined) {
                        validatable.reset(result.reset);
                    }
                });
            }
        },
        validate: function () {
            var valid = [];
            var invalid = [];

            this.filterValidatables.apply(this, arguments).forEach(function (validatable) {
                for (var method in validatable.rules) {
                    var rule = validatable.rules[method];

                    if (rule.isEnabled() && !rule.isValid(validatable)) {
                        invalid.push({
                            message: rule.formatMessage(),
                            validatable: validatable,
                            method: method
                        });

                        validatable.isValid = false;

                        return;
                    }
                }

                valid.push({
                    validatable: validatable
                });

                validatable.isValid = true;
            });

            return {
                isValid: !invalid.length,
                invalid: invalid,
                valid: valid
            };
        },
        isValid: function () {
            var isValid = true;

            this.filterValidatables.apply(this, arguments).forEach(function (validatable) {
                for (var method in validatable.rules) {
                    var rule = validatable.rules[method];

                    if (rule.isEnabled() && !rule.isValid(validatable)) {
                        validatable.isValid = false;
                        isValid = false;

                        return;
                    }
                }

                validatable.isValid = true;
            });

            return isValid;
        },
        form: function () {
            var wellidate = this;
            var result = wellidate.validate.apply(wellidate, arguments);

            result.valid.forEach(function (valid) {
                valid.validatable.success();
            });

            result.invalid.forEach(function (invalid) {
                invalid.validatable.error(invalid.method);
            });

            wellidate.summary.show(result);

            if (wellidate.focusInvalid) {
                wellidate.focus(result.invalid.map(function (invalid) {
                    return invalid.validatable;
                }));
            }

            wellidate.container.classList.add(wellidate.wasValidatedClass);

            return !result.invalid.length;
        },
        reset: function () {
            var wellidate = this;

            wellidate.summary.reset();

            wellidate.container.classList.remove(wellidate.wasValidatedClass);

            wellidate.validatables.forEach(function (validatable) {
                validatable.reset();
            });
        },

        dispatchEvent: function (element, type, detail) {
            var event = null;

            if (typeof Event === 'function') {
                event = new CustomEvent(type, {
                    detail: detail,
                    bubbles: true
                });
            } else {
                event = document.createEvent('Event');
                event.initEvent(type, true, true);
                event.detail = detail;
            }

            element.dispatchEvent(event);
        },
        escapeAttribute: function (name) {
            return name.replace(/(["\]\\])/g, '\\$1');
        },
        focus: function (errors) {
            if (errors.length) {
                var invalid = errors[0];

                for (var i = 1; i < errors.length; i++) {
                    if (this.lastActive == errors[i].element) {
                        invalid = errors[i];

                        break;
                    } else if (invalid.element.compareDocumentPosition(errors[i].element) == 2) {
                        invalid = errors[i];
                    }
                }

                this.lastActive = invalid.element;

                if (this.focusCleanup) {
                    invalid.reset();
                }

                invalid.element.focus();
            }
        },

        bindUnobstrusive: function (validatable) {
            var wellidate = this;
            var element = validatable.element;
            var event = element.tagName == 'SELECT' || element.type == 'hidden' ? 'change' : 'input';

            validatable.elements.forEach(function (element) {
                element.addEventListener(event, function () {
                    if (element.type == 'hidden' || validatable.isDirty) {
                        validatable.validate();
                    }
                });

                element.addEventListener('focus', function () {
                    if (wellidate.focusCleanup) {
                        validatable.reset();
                    }

                    wellidate.lastActive = this;
                });

                element.addEventListener('blur', function () {
                    if (validatable.isDirty || this.value.length) {
                        validatable.isDirty = !validatable.validate();
                    }
                });
            });
        },
        bind: function () {
            var wellidate = this;

            if (wellidate.container.tagName == 'FORM') {
                wellidate.container.addEventListener('submit', function (e) {
                    if (wellidate.form()) {
                        wellidate.dispatchEvent(this, 'wellidate-valid', {
                            wellidate: wellidate
                        });

                        if (wellidate.submitHandler) {
                            e.preventDefault();

                            wellidate.submitHandler();
                        }
                    } else {
                        e.preventDefault();

                        wellidate.dispatchEvent(this, 'wellidate-invalid', {
                            wellidate: wellidate
                        });
                    }
                });

                wellidate.container.addEventListener('reset', function () {
                    wellidate.reset();
                });
            }
        }
    };

    return Wellidate;
}));
