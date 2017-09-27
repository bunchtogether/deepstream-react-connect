// @flow

import React, { createElement } from 'react';
import type { Element } from 'react';
import uuid from 'uuid';
import { sample } from 'lodash';

export class TestComponentA extends React.Component<*, *> { // eslint-disable-line react/prefer-stateless-function,react/no-multi-comp
  render() {
    return (<code {...this.props} />);
  }
}

export class TestComponentB extends React.Component<*, *> { // eslint-disable-line react/prefer-stateless-function,react/no-multi-comp
  render() {
    return (<pre {...this.props} />);
  }
}

export const generateElement = (depth: number = 0): Element<*> => {
  const type = sample([TestComponentA, TestComponentB, 'div', 'span']);
  const children = [];
  const childCount = (1 / (depth + 1)) > Math.random() ? Math.ceil(Math.random() * 4) : 0;
  for (let i = 0; i < childCount; i += 1) {
    children.push(generateElement(depth + 1));
  }
  const props = { key: uuid.v4() };
  const propertyCount = Math.ceil(Math.random() * 10);
  for (let i = 0; i < propertyCount; i += 1) {
    props[uuid.v4()] = uuid.v4();
  }
  if (childCount > 0) {
    return createElement(type, props, children);
  }
  return createElement(type, props, uuid.v4());
};
