// @flow 

import React, { createElement } from 'react';

type Instance = {
  type: string,
  props: Object,
  children: Array<Instance>
};

const KNOWN_TYPES = {

};

export const render = (instance: Instance):React.Element<*> => {
  if(KNOWN_TYPES[instance.type]) {
    return createElement(
      KNOWN_TYPES[instance.type],
      instance.props,
      instance.children.map((child) => render(child))
    )
  }
  return createElement(
    KNOWN_TYPES[instance.type],
    instance.props,
    instance.children.map((child) => render(child))
  )
};
