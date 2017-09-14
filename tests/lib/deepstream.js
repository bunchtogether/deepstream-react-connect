// @flow

import uuid from 'uuid';
import DeepstreamClient, { CONSTANTS } from 'deepstream.io-client-js';
import DeepstreamServer from 'deepstream.io';

const DEEPSTREAM_PORT = 6020;
const DEEPSTREAM_HOST = '127.0.0.1';

export const getClient = async function (username?:string = uuid.v4()):Promise<DeepstreamClient> {
  const client = DeepstreamClient(`${DEEPSTREAM_HOST}:${DEEPSTREAM_PORT}`);
  await new Promise((resolve, reject) => {
    client.on('connectionStateChanged', (connectionState) => {
      if (connectionState === CONSTANTS.CONNECTION_STATE.OPEN) {
        client.off('connectionStateChanged');
        resolve();
      } else if (connectionState === CONSTANTS.CONNECTION_STATE.ERROR) {
        reject(new Error('Connection error.'));
      }
    });
    client.login({ username });
  });
  client.delete = (name:string):Promise<void> => new Promise((resolve, reject) => {
    const record = client.record.getRecord(name);
    record.once('error', reject);
    record.once('delete', resolve);
    record.delete();
  });
  client.setData = (name:string, data:Object):Promise<void> => new Promise((resolve, reject) => {
    client.record.setData(name, data, (error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
  client.getData = (name:string):Promise<Object> => new Promise((resolve, reject) => {
    client.record.snapshot(name, (error, data) => {
      if (error) {
        reject(error);
      } else {
        resolve(data);
      }
    });
  });
  client.shutdown = async function () {
    await new Promise((resolve) => {
      const currentConnectionState = client.getConnectionState();
      if (currentConnectionState === CONSTANTS.CONNECTION_STATE.CLOSED || currentConnectionState === CONSTANTS.CONNECTION_STATE.ERROR) {
        client.off('connectionStateChanged');
        resolve();
      }
      client.on('connectionStateChanged', (connectionState) => {
        if (connectionState === CONSTANTS.CONNECTION_STATE.CLOSED || connectionState === CONSTANTS.CONNECTION_STATE.ERROR) {
          client.off('connectionStateChanged');
          resolve();
        }
      });
      client.close();
    });
  };
  return client;
};

export const getServer = async function ():Promise<DeepstreamServer> {
  const server = new DeepstreamServer({
    connectionEndpoints: {
      websocket: {
        options: {
          port: DEEPSTREAM_PORT,
        },
      },
      http: false,
    },
    logLevel: 'ERROR',
    showLogo: false,
  });
  await new Promise((resolve, reject) => {
    server.once('started', resolve);
    server.once('error', reject);
    server.start();
  });
  server.shutdown = async ():Promise<void> => {
    await new Promise((resolve, reject) => {
      server.on('error', reject);
      server.on('stopped', resolve);
      server.stop();
    });
  };
  return server;
};

