// @flow 

import React from 'react';
import renderer from 'react-test-renderer';
// import ReactTestUtils from 'react-dom/test-utils';
import TestComponent from './lib/test-component';
import { connect } from '../src';

test('Wrap a component', () => {
  const ConnectedTestComponent = connect(TestComponent);
  const component = renderer.create(<ConnectedTestComponent />);
  const tree = component.toJSON();
  console.log(tree);
});
