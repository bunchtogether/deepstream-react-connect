// @flow 

import DeepstreamClient from 'deepstream.io-client-js';
import type { ComponentType } from 'react';
import React from 'react';
import { subscribe } from '../src/lib/record';

type Props = {
  [string]:[any, Array<string>]
};

type State = {
  [string]:any
};

export default (client:DeepstreamClient, parameters:{[string]:string}, Component:ComponentType<*>):ComponentType<*> => class WrappedComponent extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {};
    this.subscriptions = {};
  }
  componentWillMount() {
    Object.keys(this.props).forEach((name) => {
      const subscription = subscribe(client, this.props[name][0], this.props[name][1], parameters);
      subscription.addCallback((value:any) => {
        if (this.state[name] !== value) {
          this.setState({
            [name]: value,
          });
        }
      });
      this.subscriptions[name] = subscription;
    });
  }
  componentWillUnmount() {
    Object.keys(this.subscriptions).forEach((name) => this.subscriptions[name].close());
  }
  subscriptions: {
    [string]: {
      addCallback:Function,
      close: Function
    }
  };
  render() {
    return <Component {...this.state} />;
  }
};

