// @flow 

import type { Element, ComponentType } from 'react';
import DeepstreamClient from 'deepstream.io-client-js';
import React, { createElement } from 'react';
import murmurhash from './lib/murmurhash';

class Text extends React.Component<{value:string}> { // eslint-disable-line react/prefer-stateless-function
  render() {
    return null;
  }
}

function getElementType(element:Element<*>) {
  if (typeof (element.type.displayName) === 'string') {
    return element.type.displayName;
  }
  if (typeof (element.type) === 'string') {
    return element.type;
  }
  if (typeof (element.type.name) === 'string') {
    return element.type.name;
  }
  throw new Error('Could not get display name of element');
}

export default class Hydrator {
  client: DeepstreamClient;
  components:{[string]:ComponentType<*>};
  constructor(client:DeepstreamClient, components:Array<ComponentType<*>>) {
    this.client = client;
    this.components = {};
    components.forEach((Component) => {
      this.components[Component.name] = Component;
    });
  }
  async dehydrate(element:Element<*>):Promise<string> {
    const response = {};
    response.type = getElementType(element);
    response.props = Object.assign({}, element.props);
    const childPromises = [];
    React.Children.map(element.props.children, (child) => {
      if (React.isValidElement(child)) {
        childPromises.push(this.dehydrate(child));
      } else {
        childPromises.push(this.dehydrate(<Text value={child} />));
      }
    });
    response.props.children = await Promise.all(childPromises);
    response.key = response.props.key = element.key === null ? murmurhash(JSON.stringify(response), 1).toString(36) : element.key.toString();
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
  hydrate(key:string, callback: Function):Function {
    const record = this.client.record.getRecord(key);
    const localStorageValue = localStorage.getItem(key);
    const children = {};
    const childUnsubscribes = {};
    const valueListener = async (value:any, setCache: boolean = true) => {
      if (!value) {
        callback(null);
        return;
      }
      if (setCache) {
        setImmediate(() => {
          localStorage.setItem(key, JSON.stringify(value));
        });
      }
      const componentType = this.components[value.type] || value.type;
      if (componentType === 'Text') {
        callback(value.props.value);
        return;
      }
      const props = Object.assign({}, value.props);
      delete props.children;
      await Promise.all(Object.keys(children).map(async (childKey) => {
        if (value.props.children.indexOf(childKey) === -1) {
          const unsubscribeChild = childUnsubscribes[childKey].unsubscribe;
          delete childUnsubscribes[childKey];
          delete children[childKey];
          await unsubscribeChild();
        }
      }));
      value.props.children.forEach((childKey:string) => {
        childUnsubscribes[childKey] = this.hydrate(childKey, (child) => {
          children[childKey] = child;
          callback(createElement(componentType, props, value.props.children.map((ck) => children[ck] || null)));
        });
      });
      callback(createElement(componentType, props, value.props.children.map((ck) => children[ck] || null)));
    };
    if (localStorageValue) {
      valueListener(JSON.parse(localStorageValue), false);
      record.subscribe(valueListener, record.isReady);
    } else {
      record.subscribe(valueListener, true);
    }
    return async () => {
      await Promise.all(Object.keys(childUnsubscribes).map((childKey) => childUnsubscribes[childKey]()));
      if (record.isDestroyed) {
        return;
      }
      record.unsubscribe();
      if (!record.isReady) {
        await new Promise((resolve, reject) => {
          record.once('ready', () => {
            resolve();
          });
          record.once('error', reject);
        });
      }
      await new Promise((resolve, reject) => {
        record.once('discard', () => {
          resolve();
        });
        record.once('error', reject);
        record.discard();
      });
    };
  }
}
