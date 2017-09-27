# Deepstream-React Connect

## Usage

### Connect
```js
import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'deepstream-react-connect';
import deepstream from 'deepstream.io-client-js';

class ExampleComponent extends React.Component {
  render() {
    return (<div>{this.props.text}</div>);
  }
}

const client = deepstream("127.0.0.1:6020").login();

const user_id = "user-A";
const device_id = "device-A";

const parameters = { user_id, device_id };

const ConnectedExampleComponent = connect(client, parameters, ExampleComponent);

const element = (<ConnectedExampleComponent text=["Default Text", [":device_id/text", ":user_id/text"]] />);

ReactDOM.render(element, document.getElementById("container"));
// Renders <div>Default Text</div>

client.record.setData(`${user_id}/text`, {value: "User Text"});
// Renders <div>User Text</div>

client.record.setData(`${device_id}/text`, {value: "Device Text"});
// Renders <div>Device Text</div>
```

### Marshaler
```js
import React from 'react';
import ReactDOM from 'react-dom';
import { Marshaler } from 'deepstream-react-connect';

class ExampleComponent extends React.Component {
  render() {
    return (<div {...this.props} />);
  }
}

const marshaler = new Marshaler([ExampleComponent]);

const element = (<ExampleComponent key="exampleKey"><span>Example Text</span></ExampleComponent>);

const instance = marshaler.marshal(component);

//{
//  "type": "ExampleComponent",
//  "props": {},
//  "children": [
//    {
//      "type": "span",
//      "props": {},
//      "children": [
//        {
//          "type": "Text",
//          "props": {
//            "value": "Example Text"
//          },
//          "children": [],
//          "key": "230d9fec7d745d58a0de0558b5d5b6ac"
//        }
//      ],
//      "key": "4045ccd70148bf5a19f5f715c62c6944"
//    }
//  ],
//  "key": "exampleKey"
//}

const element = marshaler.unmarshal(instance);

ReactDOM.render(rehydratedElement, document.getElementById("container"));
// Renders <div><span>Example Text</span></div>  

```


### Hydrator
```js
import React from 'react';
import ReactDOM from 'react-dom';
import { Hydrator } from 'deepstream-react-connect';
import deepstream from 'deepstream.io-client-js';

class ExampleComponent extends React.Component {
  render() {
    return (<div {...this.props} />);
  }
}

const client = deepstream("127.0.0.1:6020").login();

const hydrator = new Hydrator(client, [ExampleComponent]);

const element = (<ExampleComponent key="exampleKey"><span>Example Text</span></ExampleComponent>);

const dehydrateThenRehydrate = async () => {
  const key = await hydrator.dehydrate(component);
  // key === "exampleKey"
  const unsubscribeHydrator = hydrator.hydrate(key, (rehydratedElement) => {
    // Will check cache and return null while loading
    if(rehydratedElement !== null) {
      return;
    }
    // rehydratedElement == element
    ReactDOM.render(rehydratedElement, document.getElementById("container"));
    // Renders <div><span>Example Text</span></div>  
    unsubscribeHydrator(); 
  });
}

dehydrateThenRehydrate();

```

### Hydrator + Marshaler
```js
import React from 'react';
import ReactDOM from 'react-dom';
import { Hydrator } from 'deepstream-react-connect';
import deepstream from 'deepstream.io-client-js';

class ExampleComponent extends React.Component {
  render() {
    return (<div {...this.props} />);
  }
}

const client = deepstream("127.0.0.1:6020").login();

const marshaler = new Marshaler([ExampleComponent]);

const element = (<ExampleComponent key="exampleKey"><span>Example Text</span></ExampleComponent>);

const instance = marshaler.marshal(component);

// Array containing ExampleComponent 
// is not required if marshaling is done earlier.
const hydrator = new Hydrator(client); 

hydrator.store(instance).then(() => console.log("Instance stored."));


```



