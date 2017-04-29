/* eslint-disable no-console, no-restricted-syntax */
import is from 'is_js';
import _fetch from './fetch';

const events = {};

export function isFieldExist(fields, object) {
  for (let i = 0, len = fields.length; i < len; i += 1) {
    if (!object[fields[i]]) {
      if (process.env.NODE_ENV === 'development') {
        console.error(`${fields[i]} doesn't exist in ${object}`);
      }
      return false;
    }
  }
  return true;
}

export function log(msg, type = 'log') {
  if (process.env.NODE_ENV === 'development') {
    if (type && console[type] !== undefined) {
      console[type](msg);
    } else {
      console.log(msg);
    }
  }
}

export function fetch({
  url, body = '', method = 'post',
  type = 'application/json',
  encode = 'utf-8' }) {
  return _fetch(url, {
    method,
    headers: {
      Accept: `${type}`,
      'Content-Type': `${type}; charset=${encode}`,
    },
    body,
    credentials: 'include',
  });
}

export function debounce(func, { prefunc, timespan = 25 }) {
  let clearTime;
  return function () { // eslint-disable-line func-names
    if (clearTime) return;
    const args = arguments; // eslint-disable-line prefer-rest-params
    if (prefunc) prefunc.apply(this, args);

    clearTime = setTimeout(() => {
      clearTime = null;
      func.apply(this, args);
    }, timespan);
  };
}

export function on(element, event, handler, useCapture = false) {
  if (element.addEventListener) {
    element.addEventListener(event, handler, useCapture);
  }
  if (!events[element]) events[element] = {};
  if (!events[element][event]) events[element][event] = [];
  events[element][event].push(handler);
}

export function off(element, event, handler) {
  if (!events[element]) return;
  if (!events[element][event]) return;

  for (let i = 0, len = events[element][event].length; i < len; i += 1) {
    if (handler && events[element][event][i] === handler) {
      events[element][event].splice(i, 1);
      element.removeEventListener(event, handler);
      return;
    }
    element.removeEventListener(event, events[element][event][i]);
    events[element][event].splice(i, 1);
  }
}

export function isBrowser() {
  return global && global.toString() === '[object Window]';
}

export function onBrowser(func) {
  if (isBrowser()) {
    if (is.function(func)) func();
  }
}

export function delayUpdate(nextProps, nextState, wait = 100) {
  const timespan = Date.now() - this.lastUpdateTime;
  if (timespan < wait) {
    this.nextState = Object.assign({}, this.state, nextState);
    if (this.updateTimeout) return false;
    this.updateTimeout = setTimeout(() => {
      this.setState(this.nextState);
      this.updateTimeout = null;
    }, wait - timespan);
    return false;
  }
  return true;
}

export function fliterObject(object) {
  const newObject = {};
  for (const p in object) {
    if (object[p] !== undefined) {
      newObject[p] = object[p];
    }
  }
  return newObject;
}
