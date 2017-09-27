// @flow 

import React from 'react';
import expect from 'expect';
import renderer from 'react-test-renderer';
import { Marshaller } from '../src';
import { TestComponentA, TestComponentB, generateElement } from './lib/react';

test('Marshall and unmarshall an element', () => {
  const element = generateElement();
  const elementData = renderer.create(element).toJSON();
  const marshaller = new Marshaller([TestComponentA, TestComponentB]);
  const marshalled = marshaller.marshall(element);
  const unmarshalledElement = marshaller.unmarshall(marshalled);
  const unmarshalledElementData = renderer.create(unmarshalledElement).toJSON();
  expect(elementData).toEqual(unmarshalledElementData);
});

test('Marshall and unmarshall an element with text nodes.', () => {
  const element = <div>A<span>B</span></div>;
  const elementData = renderer.create(element).toJSON();
  const marshaller = new Marshaller([TestComponentA, TestComponentB]);
  const marshalled = marshaller.marshall(element);
  const unmarshalledElement = marshaller.unmarshall(marshalled);
  const unmarshalledElementData = renderer.create(unmarshalledElement).toJSON();
  expect(elementData).toEqual(unmarshalledElementData);
});

