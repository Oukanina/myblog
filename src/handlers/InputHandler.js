import is from 'is_js';
import { debounce, on, off, log } from '../core/utils';
import { CHARACTERREX, KEYMAP } from '../constants';

export function isCharacter(key) {
  return CHARACTERREX.test(key);
}

export function isSpecialKey(keyCode) {
  for (const k in KEYMAP) { // eslint-disable-line no-restricted-syntax
    if (KEYMAP[k] === keyCode) return true;
  }
  return false;
}

const defaultOptions = {
  deplay: 50,
};

export default class InputHandler {
  constructor(handlers, options = defaultOptions) {
    this.state = {
      pause: false,
      running: false,
    };

    this.event = {};
    this.delay = options.delay;
    this.stopCharacterHandler = false;
    this.stopSpecialKeyHandler = false;

    this.keyDownHandler = this.keyDownHandler.bind(this);
    this.initialHandlers(handlers);
  }

  initialHandlers(handlers) {
    this.handlers = handlers;
  }

  start() {
    this.state.running = true;
    this.on();
  }

  stop() {
    this.state.running = false;
    this.destory();
  }

  pause() {
    this.state.pause = true;
  }

  resume() {
    this.state.pause = false;
  }

  on() {
    log('bind keydown event');
    on(window, 'keydown', this.keyDownHandler());
  }

  off() {
    off(window, 'keydown', this.keyDownHandler());
  }

  destory() {
    off(window, 'keydown', this.keyDownHandler());
    this.keyDownHandler = null;
    this.handlers = null;
    this.state.running = false;
    this.state.pause = false;
  }

  runHandler(handlerName) {
    if (!this.handlers[handlerName]) return;
    if (is.not.function(this.handlers[handlerName])) return;

    this.handlers[handlerName](this.event);
  }

  keyDownHandler() {
    return debounce((event) => {
      if (this.state.pause) return;
      this.event = event;
      if (!this.stopCharacterHandler) this.characterHandler(event.key);
      if (!this.stopSpecialKeyHandler) this.specialKeyHandler(event.keyCode);
    }, {
      prefunc: (event) => {
        event.preventDefault();
      },
      timespan: this.deplay,
    });
  }

  characterHandler(key) {
    if (!isCharacter(key)) return;
    this.runHandler('characterHandler');
  }

  specialKeyHandler(keyCode) {
    if (!isSpecialKey(keyCode)) return;

    switch (keyCode) {
      case KEYMAP.TAB:
        this.runHandler('tabHandler');
        break;
      case KEYMAP.UP:
        this.runHandler('upHandler');
        break;
      case KEYMAP.DOWN:
        this.runHandler('downHandler');
        break;
      case KEYMAP.LEFT:
        this.runHandler('leftHandler');
        break;
      case KEYMAP.RIGHT:
        this.runHandler('rightHandler');
        break;
      case KEYMAP.BACKSPACE:
        this.runHandler('backspaceHandler');
        break;
      case KEYMAP.ENTER:
        this.runHandler('enterHandler');
        break;
      case KEYMAP.ESC:
        this.runHandler('escHandler');
        break;
      case KEYMAP.SPACE:
        this.runHandler('spaceHandler');
        break;
      case KEYMAP.ALT:
        this.runHandler('altHandler');
        break;
      case KEYMAP.SHIFT:
        this.runHandler('shiftHandler');
        break;
      case KEYMAP.CTRL:
        this.runHandler('ctrlHandler');
        break;
      case KEYMAP.END:
        this.runHandler('endHandler');
        break;
      case KEYMAP.HOME:
        this.runHandler('homeHandler');
        break;
      default:
        break;
    }
  }
}
