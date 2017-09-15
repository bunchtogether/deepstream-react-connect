// @flow 

import uuid from 'uuid';
import renderer from 'react-test-renderer';
import React, { createElement } from 'react';
import { connect } from '../src';
import { getClient, getServer } from './lib/deepstream';


const generateParameterName = () => uuid.v4().replace(/[^a-z_]/g, '');

class TestComponent extends React.Component<*, *> { // eslint-disable-line react/prefer-stateless-function
  render() {
    return (<div {...this.props} />);
  }
}

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


test('Wrap a component', async () => {
  const parameterNameA = generateParameterName();
  const parameterNameB = generateParameterName();
  const parameterNameC = generateParameterName();
  const parameterValueA = uuid.v4();
  const parameterValueB = uuid.v4();
  const parameterValueC = uuid.v4();
  const parameters = {
    [parameterNameA]: parameterValueA,
    [parameterNameB]: parameterValueB,
    [parameterNameC]: parameterValueC,
  };
  const nameA = uuid.v4();
  const nameB = uuid.v4();
  const nameC = uuid.v4();
  const defaultValue = uuid.v4();
  const valueA = uuid.v4();
  const valueB = uuid.v4();
  const valueC = uuid.v4();
  const names = [`${nameA}/:${parameterNameA}`, `${nameB}/:${parameterNameB}`, `${nameC}/:${parameterNameC}`];
  const propName = uuid.v4();
  const props = { [propName]: [defaultValue, names] };
  const WrappedTestComponent = connect(client, parameters, TestComponent);
  const wrappedTestComponent = renderer.create(createElement(WrappedTestComponent, props));
  const getComputedProps = () => wrappedTestComponent.toJSON().props;
  expect(getComputedProps()).toEqual({ [propName]: defaultValue });
  await client.setData(`${nameC}/${parameterValueC}`, { value: valueC });
  expect(getComputedProps()).toEqual({ [propName]: valueC });
  await client.setData(`${nameB}/${parameterValueB}`, { value: valueB });
  expect(getComputedProps()).toEqual({ [propName]: valueB });
  await client.setData(`${nameA}/${parameterValueA}`, { value: valueA });
  expect(getComputedProps()).toEqual({ [propName]: valueA });
});

