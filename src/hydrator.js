// @flow 

import type { Element, ComponentType } from 'react';

import uuid from 'uuid';
import DeepstreamClient from 'deepstream.io-client-js';
import React, { createElement } from 'react';

export class Text extends React.Component<{value:string}> { // eslint-disable-line react/prefer-stateless-function
  render() {
    return null;
  }
}

function getElementType(element:Element<*>) {
  if (typeof (element.type) === 'string') {
    return element.type;
  }
  if (typeof (element.type.name) === 'string') {
    return element.type.name;
  }
  if (typeof (element.type.displayName) === 'string') {
    return element.type.displayName;
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
    response.props.key = response.props.key || uuid.v4();
    const childPromises = [];
    React.Children.map(element.props.children, (child) => {
      if (React.isValidElement(child)) {
        childPromises.push(this.dehydrate(child));
      } else {
        childPromises.push(this.dehydrate(<Text value={child} />));
      }
    });
    response.props.children = await Promise.all(childPromises);
    await new Promise((resolve, reject) => {
      this.client.record.setData(response.props.key, response, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
    return response.props.key;
  }
  async hydrate(key:string):Promise<Element<*> | string> {
    const response = await new Promise((resolve, reject) => {
      this.client.record.snapshot(key, (error, data) => {
        if (error) {
          reject(error);
        } else {
          resolve(data);
        }
      });
    });
    const componentType = this.components[response.type] || response.type;
    if (componentType === 'Text') {
      return response.props.value;
    }
    const children = await Promise.all(response.props.children.map(this.hydrate.bind(this)));
    delete response.props.children;
    return createElement(componentType, response.props, children);
  }
}
