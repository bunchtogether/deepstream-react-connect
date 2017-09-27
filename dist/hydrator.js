'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _deepstream = require('deepstream.io-client-js');

var _deepstream2 = _interopRequireDefault(_deepstream);

var _marshaler = require('./marshaler');

var _marshaler2 = _interopRequireDefault(_marshaler);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Hydrator = function () {
  function Hydrator(client) {
    var components = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
    (0, _classCallCheck3.default)(this, Hydrator);

    this.client = client;
    this.marshaler = new _marshaler2.default(components);
  }

  (0, _createClass3.default)(Hydrator, [{
    key: 'store',
    value: function () {
      var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(instance) {
        var _this = this;

        var response;
        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                response = Object.assign({}, instance);
                _context.next = 3;
                return Promise.all(instance.children.map(this.store.bind(this)));

              case 3:
                response.children = _context.sent;
                _context.next = 6;
                return new Promise(function (resolve, reject) {
                  _this.client.record.setData(response.key, response, function (error) {
                    if (error) {
                      reject(error);
                    } else {
                      resolve();
                    }
                  });
                });

              case 6:
                return _context.abrupt('return', response.key);

              case 7:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function store(_x2) {
        return _ref.apply(this, arguments);
      }

      return store;
    }()
  }, {
    key: 'dehydrate',
    value: function () {
      var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(element) {
        var instance;
        return _regenerator2.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                instance = this.marshaler.marshal(element);
                _context2.next = 3;
                return this.store(instance);

              case 3:
                return _context2.abrupt('return', instance.key);

              case 4:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function dehydrate(_x3) {
        return _ref2.apply(this, arguments);
      }

      return dehydrate;
    }()
  }, {
    key: 'listen',
    value: function listen(key, callback) {
      var _this2 = this;

      var record = this.client.record.getRecord(key);
      var localStorageValue = localStorage.getItem(key);
      var children = {};
      var childUnsubscribes = {};
      var valueListener = function valueListener(value) {
        var setCache = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

        if (!value) {
          callback(null);
          return;
        }
        if (Object.keys(value).length === 0) {
          callback(null);
          return;
        }
        if (setCache) {
          setImmediate(function () {
            localStorage.setItem(key, JSON.stringify(value));
          });
        }
        var instance = {
          type: value.type,
          key: key,
          props: value.props,
          children: []
        };
        Object.keys(children).forEach(function (childKey) {
          if (value.children.indexOf(childKey) === -1) {
            var unsubscribeChild = childUnsubscribes[childKey];
            delete childUnsubscribes[childKey];
            delete children[childKey];
            unsubscribeChild();
          }
        });
        value.children.forEach(function (childKey) {
          childUnsubscribes[childKey] = _this2.listen(childKey, function (child) {
            children[childKey] = child;
            instance.children = value.children.map(function (ck) {
              return children[ck];
            });
            callback(instance);
          });
        });
        callback(instance);
      };

      if (localStorageValue) {
        valueListener(JSON.parse(localStorageValue), false);
        record.subscribe(valueListener, record.isReady);
      } else {
        record.subscribe(valueListener, true);
      }

      return (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3() {
        var childKeys, i;
        return _regenerator2.default.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                if (record.isDestroyed) {
                  _context3.next = 4;
                  break;
                }

                record.unsubscribe();
                _context3.next = 4;
                return new Promise(function (resolve, reject) {
                  record.once('discard', function () {
                    resolve();
                  });
                  record.once('error', reject);
                  record.discard();
                });

              case 4:
                childKeys = Object.keys(childUnsubscribes);
                i = 0;

              case 6:
                if (!(i < childKeys.length)) {
                  _context3.next = 12;
                  break;
                }

                _context3.next = 9;
                return childUnsubscribes[childKeys[i]]();

              case 9:
                i += 1;
                _context3.next = 6;
                break;

              case 12:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, _this2);
      }));
    }
  }, {
    key: 'hydrate',
    value: function hydrate(key, callback) {
      var _this3 = this;

      return this.listen(key, function (instance) {
        return callback(instance ? _this3.marshaler.unmarshal(instance) : null);
      });
    }
  }]);
  return Hydrator;
}();

exports.default = Hydrator;