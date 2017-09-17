// @flow 

import type { Element } from 'react';
import expect from 'expect';
import renderer from 'react-test-renderer';
import uuid from 'uuid';
import React, { createElement } from 'react';
import { sample } from 'lodash';
import { Hydrator } from '../src';
import { getClient, getServer } from './lib/deepstream';

class TestComponentA extends React.Component<*, *> { // eslint-disable-line react/prefer-stateless-function,react/no-multi-comp
  render() {
    return (<code {...this.props} />);
  }
}

class TestComponentB extends React.Component<*, *> { // eslint-disable-line react/prefer-stateless-function,react/no-multi-comp
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

let client;
let server;

beforeAll(async () => {
  server = await getServer();
  client = await getClient();
});

afterAll(async () => {
  await client.shutdown();
  await server.shutdown();
});

test('Dehydrate and hydrate an element', async () => {
  const element = generateElement();
  const elementData = renderer.create(element).toJSON();
  const hydrator = new Hydrator(client, [TestComponentA, TestComponentB]);
  const key = await hydrator.dehydrate(element);
  const rehydratedElement = await hydrator.hydrate(key);
  const rehydratedElementData = renderer.create(rehydratedElement).toJSON();
  expect(elementData).toEqual(rehydratedElementData);
});

test('Dehydrate and hydrate an element with text nodes.', async () => {
  const element = <div>A<span>B</span></div>;
  const elementData = renderer.create(element).toJSON();
  const hydrator = new Hydrator(client, [TestComponentA, TestComponentB]);
  const key = await hydrator.dehydrate(element);
  const rehydratedElement = await hydrator.hydrate(key);
  const rehydratedElementData = renderer.create(rehydratedElement).toJSON();
  expect(elementData).toEqual(rehydratedElementData);
});

test('Update the value of a node by key.', async () => {
  const textKey = uuid.v4();
  const defaultTextValue = uuid.v4();
  const hydrator = new Hydrator(client, []);
  const key = await hydrator.dehydrate(<div><span key={textKey}>{defaultTextValue}</span></div>);
  const updatedTextValue = uuid.v4();
  await hydrator.dehydrate(<span key={textKey}>{updatedTextValue}</span>);
  const updatedElementData = renderer.create(<div><span>{updatedTextValue}</span></div>).toJSON();
  const rehydratedElement = await hydrator.hydrate(key);
  const rehydratedElementData = renderer.create(rehydratedElement).toJSON();
  expect(updatedElementData).toEqual(rehydratedElementData);
});

