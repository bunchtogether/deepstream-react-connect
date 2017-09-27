// @flow 

import type { Element, ComponentType } from 'react';
import React, { createElement } from 'react';
import murmurhash from 'murmurhash3js';

export type Instance = {
  type: string,
  key: string,
  props: {[string]: any},
  children: Array<Instance>
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


class Text extends React.Component<{value:string}> { // eslint-disable-line react/prefer-stateless-function
  render() {
    return null;
  }
}

export default class Marshaler {
  components:{[string]:ComponentType<*>};

  constructor(components:Array<ComponentType<*>>) {
    this.components = {};
    components.forEach((Component) => {
      this.components[Component.displayName || Component.name] = Component;
    });
  }

  marshal = (element:Element<any>):Instance => {
    const children = [];
    React.Children.map(element.props.children, (child) => {
      if (React.isValidElement(child)) {
        children.push(this.marshal(child));
      } else {
        children.push(this.marshal(<Text value={child} />));
      }
    });
    const props = Object.assign({}, element.props);
    delete props.children;
    const instance:Object = {
      type: getElementType(element),
      props,
      children,
    };
    instance.key = element.key === null ? murmurhash.x64.hash128(JSON.stringify(instance)) : element.key.toString();
    return instance;
  }

  unmarshal = (instance:Instance):Element<any> => {
    const componentType = this.components[instance.type] || instance.type;
    const props = Object.assign({ key: instance.key }, instance.props);
    const children = instance.children.map((childInstance: Instance) => {
      if (!childInstance) {
        return null;
      }
      if (childInstance.type === 'Text') {
        return childInstance.props.value;
      }
      return this.unmarshal(childInstance);
    });
    return createElement(componentType, props, children);
  }
}
