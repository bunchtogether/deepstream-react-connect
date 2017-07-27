// @flow

import uuid from 'uuid';
import type { Instance } from '../../src/hydrator';

export const generateInstance = (depth: number = 0): Instance => {
  const name = `_${uuid.v4().replace(/[^a-z0-9]/g, '')}`;
  const instance: Instance = {
    type: name,
    props: {},
    children: null,
  };
  const childCount = (1 / (depth + 1)) > Math.random() ? Math.ceil(Math.random() * 4) : 0;
  if (childCount > 0) {
    instance.children = [];
    for (let i = 0; i < childCount; i += 1) {
      instance.children.push(generateInstance(depth + 1));
    }
  }
  const propertyCount = Math.ceil(Math.random() * 10);
  for (let i = 0; i < propertyCount; i += 1) {
    instance.props[uuid.v4()] = uuid.v4();
  }
  return instance;
};

export const addInstanceKeys = (instance: Instance): Instance => ({
  type: instance.type,
  props: Object.assign({}, instance.props, { key: uuid.v4() }),
  children: instance.children ? instance.children.map(addInstanceKeys) : null,
});
