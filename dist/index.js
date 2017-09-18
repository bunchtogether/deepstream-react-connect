'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _connect = require('./connect');

Object.defineProperty(exports, 'connect', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_connect).default;
  }
});

var _hydrator = require('./hydrator');

Object.defineProperty(exports, 'Hydrator', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_hydrator).default;
  }
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }