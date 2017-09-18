// @node 

import { LocalStorage } from 'node-localstorage';
import os from 'os';
import uuid from 'uuid';
import path from 'path';

const localStorage = new LocalStorage(path.resolve(os.tmpdir(), uuid.v4()));

Object.defineProperty(window, 'localStorage', { value: localStorage });
