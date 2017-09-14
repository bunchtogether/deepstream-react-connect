// @flow 
import type { ComponentType } from 'react';
import React from 'react';

type Address = [string, ?string];

type InputPropsType = {
  [string]:{
    local?: any,
    default?: Address,
    user?: Address,
    override?: Address,
  }
};

export default function connect(
  inputProps: InputPropsType,
): (ComponentType<*>) => ComponentType<*> {
  return (Component) => class WrappedComponent extends React.PureComponent<any> { // eslint-disable-line react/prefer-stateless-function
    render() {
      const outputProps = {};
      Object.keys(inputProps).forEach((key) => { outputProps[key] = inputProps[key].local; });
      console.log(outputProps);
      return <Component {...outputProps} />;
    }
  };
}
