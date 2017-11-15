// @flow 

import DeepstreamClient from 'deepstream.io-client-js';
import type { ComponentType } from 'react';
import React from 'react';
import { subscribe } from './lib/record';

type Props = {
  [string]:[any, Array<string>]
};

type State = {
  [string]:any
};

export default (client:DeepstreamClient, parameters:{[string]:string}, Component:ComponentType<*>):ComponentType<*> => class ConnectedComponent extends React.PureComponent<Props, State> {
  static displayName = `Connected${Component.displayName || Component.name}`;

  constructor(props: Props) {
    super(props);
    this.state = {};
    this.subscriptions = {};
  }

  componentWillMount() {
    this.setSubscriptions(this.props);
  }

  componentWillReceiveProps(nextProps:Props) {
    this.unsetSubscriptions();
    this.setSubscriptions(nextProps);
  }

  componentWillUnmount() {
    this.unsetSubscriptions();
  }

  setSubscriptions(props:Props) {
    Object.keys(props).forEach((name) => {
      if (name === 'children') {
        return;
      }
      const subscription = subscribe(client, props[name][0], props[name][1], parameters);
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

  unsetSubscriptions() {
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

