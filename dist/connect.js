'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

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

var _record = require('../src/lib/record');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (client, parameters, Component) {
  var _class, _temp;

  return _temp = _class = function (_React$PureComponent) {
    (0, _inherits3.default)(ConnectedComponent, _React$PureComponent);

    function ConnectedComponent(props) {
      (0, _classCallCheck3.default)(this, ConnectedComponent);

      var _this = (0, _possibleConstructorReturn3.default)(this, (ConnectedComponent.__proto__ || Object.getPrototypeOf(ConnectedComponent)).call(this, props));

      _this.state = {};
      _this.subscriptions = {};
      return _this;
    }

    (0, _createClass3.default)(ConnectedComponent, [{
      key: 'componentWillMount',
      value: function componentWillMount() {
        var _this2 = this;

        Object.keys(this.props).forEach(function (name) {
          var subscription = (0, _record.subscribe)(client, _this2.props[name][0], _this2.props[name][1], parameters);
          subscription.addCallback(function (value) {
            if (_this2.state[name] !== value) {
              _this2.setState((0, _defineProperty3.default)({}, name, value));
            }
          });
          _this2.subscriptions[name] = subscription;
        });
      }
    }, {
      key: 'componentWillUnmount',
      value: function componentWillUnmount() {
        var _this3 = this;

        Object.keys(this.subscriptions).forEach(function (name) {
          return _this3.subscriptions[name].close();
        });
      }
    }, {
      key: 'render',
      value: function render() {
        return _react2.default.createElement(Component, this.state);
      }
    }]);
    return ConnectedComponent;
  }(_react2.default.PureComponent), _class.displayName = 'Connected' + (Component.displayName || Component.name), _temp;
};