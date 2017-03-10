import is from 'is_js';
import { log } from './utils';
import { me } from './api';


class State {
  constructor() {
    this.stateMap = new Map();
    this.listenerMap = new Map();
  }

  initialState() {
    log('start init state...');
    this.set('historyCommands', []);
    this.set('currentCommand', []);
    this.set('cursorPosition', 1);
    this.set('path', '~');
    this.set('username', '...');
    this.set('hostname', '...');
    this.set('login', false);
    this.set('fetchData', '');
    this.set('test', 'test');

    this.set('screenElement', {});
    this.set('containerElement', {});

    this.set('toBottom');
    this.set('wheel');
  }

  async fetchData() {
    if (this.get('fetchData') === 'done') return;
    if (this.get('fetchData') === 'pending') return;
    this.set('fetchData', 'pending');
    try {
      const res = await me();
      const json = await res.json();

      for (const p in json) { // eslint-disable-line no-restricted-syntax
        if (this.get(p)) {
          this.update(p, json[p]);
        }
      }
      this.update('login', true);
      this.set('fetchData', 'done');
    } catch (err) {
      this.set('fetchData', '');
      console.error(err); // eslint-disable-line no-console
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
  }

  get(stateName) {
    return this.stateMap.get(stateName);
  }

  set(stateName, state) {
    this.stateMap.set(stateName, state);
  }

  del(stateName) {
    this.stateMap.remove(stateName);
  }

  trigger(stateName) {
    const listeners = this.listenerMap.get(stateName);
    if (!listeners) {
      log(`no listeners on ${stateName}`);
      // todo
      return;
    }
    listeners.map(listener => listener(this.stateMap.get(stateName),
      stateName, this.stateMap));
  }

  update(stateName, newState) {
    this.stateMap.set(stateName, newState);
    this.trigger(stateName);
  }

  updateAll() {
    this.stateMap.forEach((value, name) => {
      setTimeout(() => this.update(name, value), 0);
    });
  }
}

const state = new State();

export default state;
