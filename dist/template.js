
/*
type Address = [string, ?string];

type Prop = {
  local?: any,
  default?: Address,
  device?: Address,
  override?: Address,
};

type Props = {
  name: string,
  children: Array<string>,
  [string]: Prop
};


database[`screen`] = {
  type: "Screen",
  props: {
    children: {
      local: ['cnn'],
      device: [':deviceId/path'],
      override: ['override/path']
    }
  }
}

const volumeControl = <VolumeControl name="volumeControl" />;

const cnn = <Chrome name="cnn">
  <VCCProgram 
    name="cnnStream" 
    programId={{local:"esc_program:121"}} 
    volume={{
      local:10,
      device: ['1234/volume'],
      override: ['volume']
    }} />
    {volumeControl}
</Chrome>

const store(cnn);

database['cnn'] = {
  type: "Chrome",
  props: {
    deviceType: {
      local: 'kiosk',
      device: [':deviceId/type'], 
    },
    children: ['cnnStream'],
  }
}

database['cnnStream'] = {
  type: "VCCProgram",
  children: [],
  props: {
    name: {
      local: "cnn"
    },
    programId: {
      local: "esc_program:122",
    },
    volume: {
      local: 10,
      user: [`${deviceId}/volume`],
      override: ['override/volume']
    }
  }
}

type Instance = {
 type: string, // 
 props: Props,
 children: Array<Instance>
};

export default class Template {
  name: string;
  type: string;
  props: Props;
  children: Array<Template>;

  constructor(type: string, props: Props, children?: Array<Template> = []) {
    this.type = type;
    this.props = props;
    this.children = children;
  }
}
*/
"use strict";