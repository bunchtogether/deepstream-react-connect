// @flow 


import expect from 'expect';
import uuid from 'uuid';
import { addParameters, subscribe } from '../src/lib/record';
import { getClient, getServer } from './lib/deepstream';

let server;
let client;

const generateParameterName = () => uuid.v4().replace(/[^a-z_]/g, '');

beforeAll(async () => {
  server = await getServer();
  client = await getClient();
});

afterAll(async () => {
  await client.shutdown();
  await server.shutdown();
});

test('Should substitute parameters in a Deepstream record name.', () => {
  const parameterNameA = generateParameterName();
  const parameterNameB = generateParameterName();
  const parameterValueA = uuid.v4();
  const parameterValueB = uuid.v4();
  const name = `:${parameterNameA}/example/:${parameterNameB}`;
  const transformedName = addParameters(name, {
    [parameterNameA]: parameterValueA,
    [parameterNameB]: parameterValueB,
  });
  expect(transformedName).toEqual(`${parameterValueA}/example/${parameterValueB}`);
});

test('Should throw an error if unable to add parameters', () => {
  expect(() => addParameters(`:${generateParameterName()}`, {})).toThrow(/Unable to add parameters/);
  expect(() => addParameters(`/:${generateParameterName()}/`, {})).toThrow(/Unable to add parameters/);
  expect(() => addParameters(`${uuid.v4()}/:${generateParameterName()}/${uuid.v4()}`, {})).toThrow(/Unable to add parameters/);
});

test('Should resolve values from Deepstream records.', async () => {
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
  const subscription = subscribe(client, defaultValue, names, parameters);
  let resolvedValue;
  subscription.addCallback((value:any) => {
    resolvedValue = value;
  });
  expect(resolvedValue).toEqual(defaultValue);
  await client.setData(`${nameC}/${parameterValueC}`, { value: valueC });
  expect(resolvedValue).toEqual(valueC);
  await client.setData(`${nameB}/${parameterValueB}`, { value: valueB });
  expect(resolvedValue).toEqual(valueB);
  await client.setData(`${nameA}/${parameterValueA}`, { value: valueA });
  expect(resolvedValue).toEqual(valueA);
  await client.delete(`${nameA}/${parameterValueA}`);
  expect(resolvedValue).toEqual(valueB);
  await client.delete(`${nameB}/${parameterValueB}`);
  expect(resolvedValue).toEqual(valueC);
  await client.delete(`${nameC}/${parameterValueC}`);
  expect(resolvedValue).toEqual(defaultValue);
  await subscription.close();
});

test('Should not resolve from Deepstream records with missing parameters.', async () => {
  const parameterNameA = generateParameterName();
  const parameterValueA = uuid.v4();
  const defaultValue = uuid.v4();
  const valueA = uuid.v4();
  const nameA = uuid.v4();
  const names = [`${nameA}/:${parameterNameA}`];
  const subscription = subscribe(client, defaultValue, names, {});
  let resolvedValue;
  subscription.addCallback((value:any) => {
    resolvedValue = value;
  });
  expect(resolvedValue).toEqual(defaultValue);
  await client.setData(`${nameA}/${parameterValueA}`, { value: valueA });
  expect(resolvedValue).toEqual(defaultValue);
  await subscription.close();
});

