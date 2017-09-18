'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _deepstream = require('deepstream.io-client-js');

var _deepstream2 = _interopRequireDefault(_deepstream);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _record = require('../src/lib/record');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

exports.default = function (client, parameters, Component) {
  var _class, _temp;

  return _temp = _class = function (_React$PureComponent) {
    _inherits(ConnectedComponent, _React$PureComponent);

    function ConnectedComponent(props) {
      _classCallCheck(this, ConnectedComponent);

      var _this = _possibleConstructorReturn(this, (ConnectedComponent.__proto__ || Object.getPrototypeOf(ConnectedComponent)).call(this, props));

      _this.state = {};
      _this.subscriptions = {};
      return _this;
    }

    _createClass(ConnectedComponent, [{
      key: 'componentWillMount',
      value: function componentWillMount() {
        var _this2 = this;

        Object.keys(this.props).forEach(function (name) {
          var subscription = (0, _record.subscribe)(client, _this2.props[name][0], _this2.props[name][1], parameters);
          subscription.addCallback(function (value) {
            if (_this2.state[name] !== value) {
              _this2.setState(_defineProperty({}, name, value));
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