// @flow 

import DeepstreamClient from 'deepstream.io-client-js';
import murmurhash from './murmurhash';

const parameterRegex = /(^|\/):[a-z_]\/?/;

export const addParameters = (name: string, parameters:{[string]:string}) => {
  let transformedName = name;
  Object.keys(parameters).forEach((key) => {
    transformedName = transformedName.replace(`:${key}`, parameters[key]);
  });
  if (parameterRegex.test(transformedName)) {
    throw new Error('Unable to add parameters.');
  }
  return transformedName;
};

export const subscribe = (client:DeepstreamClient, defaultValue: any, names:Array<string>, parameters?:{[string]:string} = {}):{addCallback:Function, close: Function} => {
  const records = [];
  const cacheKeyValues = [defaultValue];
  names.forEach((name) => {
    try {
      const transformedName = addParameters(name, parameters);
      const record = client.record.getRecord(transformedName);
      cacheKeyValues.push(transformedName);
      records.push(record);
    } catch (error) {
      if (error.message === 'Unable to add parameters.') {
        return;
      }
      throw error;
    }
  });
  let useCache = true;
  const cacheKey = murmurhash(JSON.stringify(cacheKeyValues), 1).toString(36);
  const localStorageValue = localStorage.getItem(cacheKey);
  let value = localStorageValue ? JSON.parse(localStorageValue) : defaultValue;
  const recordValues = new Array(records.length);
  const recordsReady = records.map(() => false);
  const callbacks = [];
  const updateValue = ():void => {
    for (let i = 0; i < recordValues.length; i += 1) {
      if (typeof (recordValues[i]) !== 'undefined' && recordValues[i] !== value) {
        value = recordValues[i];
        callbacks.forEach((callback) => callback(value)); // eslint-disable-line no-loop-func
        return;
      }
    }
    if (useCache) {
      callbacks.forEach((callback) => callback(value));
      return;
    }
    if (defaultValue !== value) {
      value = defaultValue;
      callbacks.forEach((callback) => callback(value));
    }
  };
  records.forEach((record, index) => {
    record.once('ready', () => {
      recordsReady[index] = true;
      useCache = !(recordsReady.reduce((allAreReady, isReady) => allAreReady && isReady, true));
    });
    record.once('delete', () => {
      delete recordValues[index];
      updateValue();
    });
    record.subscribe('value', (recordValue:any) => {
      recordValues[index] = recordValue;
      updateValue();
    }, true);
  });
  const addCallback = (callback: Function):void => {
    callbacks.push(callback);
    callback(value);
  };
  addCallback((valueToCache) => {
    if (!useCache) {
      setImmediate(() => {
        localStorage.setItem(cacheKey, JSON.stringify(valueToCache));
      });
    }
  });
  const close = () => Promise.all(records.map(async (record) => {
    if (record.isDestroyed) {
      return;
    }
    record.unsubscribe('value');
    await new Promise((resolve, reject) => {
      record.once('error', (error) => {
        reject(error);
      });
      record.once('discard', () => {
        resolve();
      });
      record.discard();
    });
  }));
  updateValue();
  return { addCallback, close };
};
