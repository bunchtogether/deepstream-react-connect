'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.subscribe = exports.addParameters = undefined;

var _deepstream = require('deepstream.io-client-js');

var _deepstream2 = _interopRequireDefault(_deepstream);

var _murmurhash = require('./murmurhash');

var _murmurhash2 = _interopRequireDefault(_murmurhash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var parameterRegex = /(^|\/):[a-z_]\/?/;

var addParameters = exports.addParameters = function addParameters(name, parameters) {
  var transformedName = name;
  Object.keys(parameters).forEach(function (key) {
    transformedName = transformedName.replace(':' + key, parameters[key]);
  });
  if (parameterRegex.test(transformedName)) {
    throw new Error('Unable to add parameters.');
  }
  return transformedName;
};

var subscribe = exports.subscribe = function subscribe(client, defaultValue, names) {
  var parameters = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

  var records = [];
  var cacheKeyValues = [defaultValue];
  names.forEach(function (name) {
    try {
      var transformedName = addParameters(name, parameters);
      var record = client.record.getRecord(transformedName);
      cacheKeyValues.push(transformedName);
      records.push(record);
    } catch (error) {
      if (error.message === 'Unable to add parameters.') {
        return;
      }
      throw error;
    }
  });
  var useCache = true;
  var cacheKey = (0, _murmurhash2.default)(JSON.stringify(cacheKeyValues), 1).toString(36);
  var localStorageValue = localStorage.getItem(cacheKey);
  var value = localStorageValue ? JSON.parse(localStorageValue) : defaultValue;
  var recordValues = new Array(records.length);
  var recordsReady = records.map(function () {
    return false;
  });
  var callbacks = [];
  var updateValue = function updateValue() {
    for (var i = 0; i < recordValues.length; i += 1) {
      if (typeof recordValues[i] !== 'undefined' && recordValues[i] !== value) {
        value = recordValues[i];
        callbacks.forEach(function (callback) {
          return callback(value);
        }); // eslint-disable-line no-loop-func
        return;
      }
    }
    if (useCache) {
      callbacks.forEach(function (callback) {
        return callback(value);
      });
      return;
    }
    if (defaultValue !== value) {
      value = defaultValue;
      callbacks.forEach(function (callback) {
        return callback(value);
      });
    }
  };
  records.forEach(function (record, index) {
    record.once('ready', function () {
      recordsReady[index] = true;
      useCache = !recordsReady.reduce(function (allAreReady, isReady) {
        return allAreReady && isReady;
      }, true);
    });
    record.once('delete', function () {
      delete recordValues[index];
      updateValue();
    });
    record.subscribe('value', function (recordValue) {
      recordValues[index] = recordValue;
      updateValue();
    }, true);
  });
  var addCallback = function addCallback(callback) {
    callbacks.push(callback);
    callback(value);
  };
  addCallback(function (valueToCache) {
    if (!useCache) {
      setImmediate(function () {
        localStorage.setItem(cacheKey, JSON.stringify(valueToCache));
      });
    }
  });
  var close = function close() {
    return Promise.all(records.map(function () {
      var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(record) {
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (!record.isDestroyed) {
                  _context.next = 2;
                  break;
                }

                return _context.abrupt('return');

              case 2:
                record.unsubscribe('value');
                _context.next = 5;
                return new Promise(function (resolve, reject) {
                  record.once('error', function (error) {
                    reject(error);
                  });
                  record.once('discard', function () {
                    resolve();
                  });
                  record.discard();
                });

              case 5:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, undefined);
      }));

      return function (_x2) {
        return _ref.apply(this, arguments);
      };
    }()));
  };
  updateValue();
  return { addCallback: addCallback, close: close };
};