// @flow 

import React from 'react';
import expect from 'expect';
import renderer from 'react-test-renderer';
import { Marshaler } from '../src';
import { TestComponentA, TestComponentB, generateElement } from './lib/react';

test('Marshal and unmarshal an element', () => {
  const element = generateElement();
  const elementData = renderer.create(element).toJSON();
  const marshaler = new Marshaler([TestComponentA, TestComponentB]);
  const marshaled = marshaler.marshal(element);
  const unmarshaledElement = marshaler.unmarshal(marshaled);
  const unmarshaledElementData = renderer.create(unmarshaledElement).toJSON();
  expect(elementData).toEqual(unmarshaledElementData);
});

test('Marshal and unmarshal an element with text nodes.', () => {
  const element = <div>A<span>B</span></div>;
  const elementData = renderer.create(element).toJSON();
  const marshaler = new Marshaler([TestComponentA, TestComponentB]);
  const marshaled = marshaler.marshal(element);
  const unmarshaledElement = marshaler.unmarshal(marshaled);
  const unmarshaledElementData = renderer.create(unmarshaledElement).toJSON();
  expect(elementData).toEqual(unmarshaledElementData);
});

