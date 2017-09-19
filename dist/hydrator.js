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

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _deepstream = require('deepstream.io-client-js');

var _deepstream2 = _interopRequireDefault(_deepstream);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _murmurhash3js = require('murmurhash3js');

var _murmurhash3js2 = _interopRequireDefault(_murmurhash3js);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Text = function (_React$Component) {
  (0, _inherits3.default)(Text, _React$Component);

  function Text() {
    (0, _classCallCheck3.default)(this, Text);
    return (0, _possibleConstructorReturn3.default)(this, (Text.__proto__ || Object.getPrototypeOf(Text)).apply(this, arguments));
  }

  (0, _createClass3.default)(Text, [{
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

    (0, _classCallCheck3.default)(this, Hydrator);

    this.client = client;
    this.components = {};
    components.forEach(function (Component) {
      _this2.components[Component.name] = Component;
    });
  }

  (0, _createClass3.default)(Hydrator, [{
    key: 'dehydrate',
    value: function () {
      var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(element) {
        var _this3 = this;

        var response, childPromises;
        return _regenerator2.default.wrap(function _callee$(_context) {
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

                response.key = response.props.key = element.key === null ? _murmurhash3js2.default.x64.hash128(JSON.stringify(response)) : element.key.toString();
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
        var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3(value) {
          var setCache = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
          var componentType, props;
          return _regenerator2.default.wrap(function _callee3$(_context3) {
            while (1) {
              switch (_context3.prev = _context3.next) {
                case 0:
                  if (value) {
                    _context3.next = 3;
                    break;
                  }

                  callback(null);
                  return _context3.abrupt('return');

                case 3:
                  if (!(Object.keys(value).length === 0)) {
                    _context3.next = 6;
                    break;
                  }

                  callback(null);
                  return _context3.abrupt('return');

                case 6:
                  if (setCache) {
                    setImmediate(function () {
                      localStorage.setItem(key, JSON.stringify(value));
                    });
                  }
                  componentType = _this4.components[value.type] || value.type;

                  if (!(componentType === 'Text')) {
                    _context3.next = 11;
                    break;
                  }

                  callback(value.props.value);
                  return _context3.abrupt('return');

                case 11:
                  props = Object.assign({}, value.props);

                  delete props.children;
                  _context3.next = 15;
                  return Promise.all(Object.keys(children).map(function () {
                    var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(childKey) {
                      var unsubscribeChild;
                      return _regenerator2.default.wrap(function _callee2$(_context2) {
                        while (1) {
                          switch (_context2.prev = _context2.next) {
                            case 0:
                              if (!(value.props.children.indexOf(childKey) === -1)) {
                                _context2.next = 6;
                                break;
                              }

                              unsubscribeChild = childUnsubscribes[childKey];

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

                case 15:
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

                case 17:
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
      return (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4() {
        return _regenerator2.default.wrap(function _callee4$(_context4) {
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