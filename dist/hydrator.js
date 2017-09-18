'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _deepstream = require('deepstream.io-client-js');

var _deepstream2 = _interopRequireDefault(_deepstream);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _murmurhash = require('./lib/murmurhash');

var _murmurhash2 = _interopRequireDefault(_murmurhash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Text = function (_React$Component) {
  _inherits(Text, _React$Component);

  function Text() {
    _classCallCheck(this, Text);

    return _possibleConstructorReturn(this, (Text.__proto__ || Object.getPrototypeOf(Text)).apply(this, arguments));
  }

  _createClass(Text, [{
    key: 'render',
    // eslint-disable-line react/prefer-stateless-function
    value: function render() {
      return null;
    }
  }]);

  return Text;
}(_react2.default.Component);

function getElementType(element) {
  if (typeof element.type.displayName === 'string') {
    return element.type.displayName;
  }
  if (typeof element.type === 'string') {
    return element.type;
  }
  if (typeof element.type.name === 'string') {
    return element.type.name;
  }
  throw new Error('Could not get display name of element');
}

var Hydrator = function () {
  function Hydrator(client, components) {
    var _this2 = this;

    _classCallCheck(this, Hydrator);

    this.client = client;
    this.components = {};
    components.forEach(function (Component) {
      _this2.components[Component.name] = Component;
    });
  }

  _createClass(Hydrator, [{
    key: 'dehydrate',
    value: function () {
      var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(element) {
        var _this3 = this;

        var response, childPromises;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                response = {};

                response.type = getElementType(element);
                response.props = Object.assign({}, element.props);
                childPromises = [];

                _react2.default.Children.map(element.props.children, function (child) {
                  if (_react2.default.isValidElement(child)) {
                    childPromises.push(_this3.dehydrate(child));
                  } else {
                    childPromises.push(_this3.dehydrate(_react2.default.createElement(Text, { value: child })));
                  }
                });
                _context.next = 7;
                return Promise.all(childPromises);

              case 7:
                response.props.children = _context.sent;

                response.key = response.props.key = element.key === null ? (0, _murmurhash2.default)(JSON.stringify(response), 1).toString(36) : element.key.toString();
                _context.next = 11;
                return new Promise(function (resolve, reject) {
                  _this3.client.record.setData(response.key, response, function (error) {
                    if (error) {
                      reject(error);
                    } else {
                      resolve();
                    }
                  });
                });

              case 11:
                return _context.abrupt('return', response.key);

              case 12:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function dehydrate(_x) {
        return _ref.apply(this, arguments);
      }

      return dehydrate;
    }()
  }, {
    key: 'hydrate',
    value: function hydrate(key, callback) {
      var _this4 = this;

      var record = this.client.record.getRecord(key);
      var localStorageValue = localStorage.getItem(key);
      var children = {};
      var childUnsubscribes = {};
      var valueListener = function () {
        var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee3(value) {
          var setCache = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
          var componentType, props;
          return regeneratorRuntime.wrap(function _callee3$(_context3) {
            while (1) {
              switch (_context3.prev = _context3.next) {
                case 0:
                  if (!(!value && !localStorageValue)) {
                    _context3.next = 3;
                    break;
                  }

                  callback(null);
                  return _context3.abrupt('return');

                case 3:
                  if (setCache) {
                    setImmediate(function () {
                      localStorage.setItem(key, JSON.stringify(value));
                    });
                  }
                  componentType = _this4.components[value.type] || value.type;

                  if (!(componentType === 'Text')) {
                    _context3.next = 8;
                    break;
                  }

                  callback(value.props.value);
                  return _context3.abrupt('return');

                case 8:
                  props = Object.assign({}, value.props);

                  delete props.children;
                  _context3.next = 12;
                  return Promise.all(Object.keys(children).map(function () {
                    var _ref3 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(childKey) {
                      var unsubscribeChild;
                      return regeneratorRuntime.wrap(function _callee2$(_context2) {
                        while (1) {
                          switch (_context2.prev = _context2.next) {
                            case 0:
                              if (!(value.props.children.indexOf(childKey) === -1)) {
                                _context2.next = 6;
                                break;
                              }

                              unsubscribeChild = childUnsubscribes[childKey].unsubscribe;

                              delete childUnsubscribes[childKey];
                              delete children[childKey];
                              _context2.next = 6;
                              return unsubscribeChild();

                            case 6:
                            case 'end':
                              return _context2.stop();
                          }
                        }
                      }, _callee2, _this4);
                    }));

                    return function (_x4) {
                      return _ref3.apply(this, arguments);
                    };
                  }()));

                case 12:
                  value.props.children.forEach(function (childKey) {
                    childUnsubscribes[childKey] = _this4.hydrate(childKey, function (child) {
                      children[childKey] = child;
                      callback((0, _react.createElement)(componentType, props, value.props.children.map(function (ck) {
                        return children[ck] || null;
                      })));
                    });
                  });
                  callback((0, _react.createElement)(componentType, props, value.props.children.map(function (ck) {
                    return children[ck] || null;
                  })));

                case 14:
                case 'end':
                  return _context3.stop();
              }
            }
          }, _callee3, _this4);
        }));

        return function valueListener(_x2) {
          return _ref2.apply(this, arguments);
        };
      }();
      if (localStorageValue) {
        valueListener(JSON.parse(localStorageValue), false);
        record.subscribe(valueListener, record.isReady);
      } else {
        record.subscribe(valueListener, true);
      }
      return _asyncToGenerator(regeneratorRuntime.mark(function _callee4() {
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _context4.next = 2;
                return Promise.all(Object.keys(childUnsubscribes).map(function (childKey) {
                  return childUnsubscribes[childKey]();
                }));

              case 2:
                if (!record.isDestroyed) {
                  _context4.next = 4;
                  break;
                }

                return _context4.abrupt('return');

              case 4:
                record.unsubscribe();

                if (record.isReady) {
                  _context4.next = 8;
                  break;
                }

                _context4.next = 8;
                return new Promise(function (resolve, reject) {
                  record.once('ready', function () {
                    resolve();
                  });
                  record.once('error', reject);
                });

              case 8:
                _context4.next = 10;
                return new Promise(function (resolve, reject) {
                  record.once('discard', function () {
                    resolve();
                  });
                  record.once('error', reject);
                  record.discard();
                });

              case 10:
              case 'end':
                return _context4.stop();
            }
          }
        }, _callee4, _this4);
      }));
    }
  }]);

  return Hydrator;
}();

exports.default = Hydrator;