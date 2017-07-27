// @flow 

import renderer from 'react-test-renderer';
import expect from 'expect';
// import ReactTestUtils from 'react-dom/test-utils';
import Hydrator from '../src/hydrator';
import { generateInstance, addInstanceKeys } from './lib/instance-utils';

const hydrator = new Hydrator();

test('Hydrate dehydrated elements', () => {
  for (let i = 0; i < 100; i += 1) {
    const dehydrated = generateInstance();
    const component = renderer.create(hydrator.hydrate(addInstanceKeys(dehydrated)));
    const redehydrated = component.toJSON();
    expect(redehydrated).toEqual(dehydrated);
  }
});

