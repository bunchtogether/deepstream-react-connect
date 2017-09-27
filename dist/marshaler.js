'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _murmurhash3js = require('murmurhash3js');

var _murmurhash3js2 = _interopRequireDefault(_murmurhash3js);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

var Marshaler = function Marshaler(components) {
  var _this2 = this;

  (0, _classCallCheck3.default)(this, Marshaler);

  this.marshal = function (element) {
    var children = [];
    _react2.default.Children.map(element.props.children, function (child) {
      if (_react2.default.isValidElement(child)) {
        children.push(_this2.marshal(child));
      } else {
        children.push(_this2.marshal(_react2.default.createElement(Text, { value: child })));
      }
    });
    var props = Object.assign({}, element.props);
    delete props.children;
    var instance = {
      type: getElementType(element),
      props: props,
      children: children
    };
    instance.key = element.key === null ? _murmurhash3js2.default.x64.hash128(JSON.stringify(instance)) : element.key.toString();
    return instance;
  };

  this.unmarshal = function (instance) {
    var componentType = _this2.components[instance.type] || instance.type;
    var props = Object.assign({ key: instance.key }, instance.props);
    var children = instance.children.map(function (childInstance) {
      if (!childInstance) {
        return null;
      }
      if (childInstance.type === 'Text') {
        return childInstance.props.value;
      }
      return _this2.unmarshal(childInstance);
    });
    return (0, _react.createElement)(componentType, props, children);
  };

  this.components = {};
  components.forEach(function (Component) {
    _this2.components[Component.displayName || Component.name] = Component;
  });
};

exports.default = Marshaler;