import is from 'is_js';
import { log } from './utils';
import { me } from './api';


function pam(map) {
  return ((res) => {
    for (const [key, value] of map.entries()) { // eslint-disable-line no-restricted-syntax
      res[key] = value; // eslint-disable-line no-param-reassign
    }
    return res;
  })({});
}

const defaultSatte = {
  historyCommands: [],
  currentCommand: [],
  history: [],
  files: [],
  path: '~',
  HOME: '~',
  username: '...',
  hostname: '...',
  lastLoginIp: '...',
  lastLoginTime: '...',
  login: false,
  showLoginInfo: false,
  hideLastLine: false,
  wheel: null,
  toBottom: null,
  cursorPosition: 1,
  lastLineHead: '',
  isFetchData: '',
};


class State {

  constructor(name) {
    this.name = name;
    this.stateMap = new Map();
    this.listenerMap = new Map();
  }

  get status() {
    return {
      map: this.stateMap.size,
      listeners: this.listenerMap.size,
    };
  }

  get state() {
    return pam(this.stateMap);
  }

  get listeners() {
    return pam(this.listenerMap);
  }

  initialState() {
    log('start init state...');
    for (const key in defaultSatte) { // eslint-disable-line guard-for-in, no-restricted-syntax
      this.set(key, defaultSatte[key]);
    }
  }

  async fetchData() {
    if (this.isFetchData === 'done') return;
    if (this.isFetchData === 'pending') return;
    this.isFetchData = 'pending';
    try {
      const res = await me();
      const json = await res.json();

      for (const p in json) { // eslint-disable-line no-restricted-syntax
        if (this.get(p)) {
          this.update(p, json[p]);
        }
      }
      this.update('login', true);
      this.isFetchData = 'done';
    } catch (err) {
      this.isFetchData = '';
      log(err); // eslint-disable-line no-console
    }
  }

  listen(arg, listener) {
    if (is.array(arg)) {
      for (let i = 0; i < arg.length; i += 1) {
        this.listenOne(arg[i], listener);
      }
    } else if (is.string(arg)) {
      this.listenOne(arg, listener);
    } else {
      throw new Error(`cant listen ${arg}`);
    }
  }

  unlisten(arg, listener) {
    if (is.array(arg)) {
      for (let i = 0; i < arg.length; i += 1) {
        this.unListenOne(arg[i], listener);
      }
    } else if (is.string(arg)) {
      this.unListenOne(arg, listener);
    } else {
      throw new Error(`can't unlisten ${arg}`);
    }
  }

  listenOne(state, listener) {
    let listeners = this.listenerMap.get(state);
    if (!listeners || is.not.array(listeners)) listeners = [];
    listeners.push(listener);
    this.listenerMap.set(state, listeners);
  }

  unListenOne(state, listener) {
    const listeners = this.listenerMap.get(state);
    // if (!listeners) throw new Error(`no listeners on ${state}`);
    if (!listeners) return;
    for (let i = 0; i < listeners.length; i += 1) {
      if (listeners[i] === listener) {
        listeners.splice(i, 1);
        break;
      }
    }
    this.listenerMap.set(state, listeners);
  }

  get(stateName) {
    return this.stateMap.get(stateName);
  }

  set(stateName, stateValue) {
    if (!this.hasOwnProperty(stateName)) { // eslint-disable-line no-prototype-builtins
      Object.defineProperty(this, stateName, {
        get: () => this.stateMap.get(stateName),
        set: (value) => {
          this.stateMap.set(stateName, value);
          this.trigger(stateName);
        },
      });
    }
    this.stateMap.set(stateName, stateValue);
  }

  del(stateName) {
    this.stateMap.remove(stateName);
  }

  trigger(stateName) {
    const listeners = this.listenerMap.get(stateName);
    if (!listeners) {
      // log(`no listeners on ${stateName}`);
      // todo
      return;
    }
    listeners.map(listener => listener(this.stateMap.get(stateName),
      stateName, this.stateMap));
  }

  update(stateName, newState) {
    if (this.hasOwnProperty(stateName)) { // eslint-disable-line no-prototype-builtins
      this[stateName] = newState;
    }
    // this.stateMap.set(stateName, newState);
    // this.trigger(stateName);
  }

  updateAll() {
    this.stateMap.forEach((value, name) => {
      setTimeout(() => this.update(name, value), 0);
    });
  }

}

const state = new State();

export default state;
