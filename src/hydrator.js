// @flow 
/*
import React, { createElement } from 'react';

export type Instance = {
  type: string,
  props: Object,
  children: ?Array<Instance>
};

const KNOWN_TYPES = {

};

export default class Hydrator { // eslint-disable-line react/prefer-stateless-function
  addComponentClass(component: React.Component<*, *, *>, displayName?: string):void {
    console.log('addComponentClass', component, displayName);
  }
  hydrate(instance: Instance):React.Element<*> {
    const children = instance.children ? instance.children.map((child) => this.hydrate(child)) : null;
    if (KNOWN_TYPES[instance.type]) {
      return createElement(
        KNOWN_TYPES[instance.type],
        instance.props,
        children,
      );
    }
    return createElement(
      instance.type,
      instance.props,
      children,
    );
  }
}
*/
