// @flow 

import type { Element, ComponentType } from 'react';
import DeepstreamClient from 'deepstream.io-client-js';
import type { Instance } from './marshaler';
import Marshaler from './marshaler';

export default class Hydrator {
  client: DeepstreamClient;
  marshaler: Marshaler;

  constructor(client:DeepstreamClient, components?:Array<ComponentType<*>> = []) {
    this.client = client;
    this.marshaler = new Marshaler(components);
  }

  async store(instance: Instance):Promise<string> {
    const response = Object.assign({}, instance);
    response.children = await Promise.all(instance.children.map(this.store.bind(this)));
    await new Promise((resolve, reject) => {
      this.client.record.setData(response.key, response, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
    return response.key;
  }

  async dehydrate(element:Element<any>):Promise<string> {
    const instance = this.marshaler.marshal(element);
    await this.store(instance);
    return instance.key;
  }

  listen(key:string, callback: Function):Function {
    const record = this.client.record.getRecord(key);
    const localStorageValue = localStorage.getItem(key);
    const children = {};
    const childUnsubscribes = {};
    const valueListener = (value:any, setCache: boolean = true) => {
      if (!value) {
        callback(null);
        return;
      }
      if (Object.keys(value).length === 0) {
        callback(null);
        return;
      }
      if (setCache) {
        setImmediate(() => {
          localStorage.setItem(key, JSON.stringify(value));
        });
      }
      const instance = {
        type: value.type,
        key,
        props: value.props,
        children: [],
      };
      Object.keys(children).forEach((childKey) => {
        if (value.children.indexOf(childKey) === -1) {
          const unsubscribeChild = childUnsubscribes[childKey];
          delete childUnsubscribes[childKey];
          delete children[childKey];
          unsubscribeChild();
        }
      });
      value.children.forEach((childKey:string) => {
        childUnsubscribes[childKey] = this.listen(childKey, (child) => {
          children[childKey] = child;
          instance.children = value.children.map((ck) => children[ck]);
          callback(instance);
        });
      });
      callback(instance);
    };

    if (localStorageValue) {
      valueListener(JSON.parse(localStorageValue), false);
      record.subscribe(valueListener, record.isReady);
    } else {
      record.subscribe(valueListener, true);
    }

    return async () => {
      if (!record.isDestroyed) {
        record.unsubscribe();
        await new Promise((resolve, reject) => {
          record.once('discard', () => {
            resolve();
          });
          record.once('error', reject);
          record.discard();
        });
      }
      const childKeys = Object.keys(childUnsubscribes);
      for (let i = 0; i < childKeys.length; i += 1) {
        await childUnsubscribes[childKeys[i]]();
      }
    };
  }

  hydrate(key:string, callback: Function):Function {
    return this.listen(key, (instance) => callback(instance ? this.marshaler.unmarshal(instance) : null));
  }
}
