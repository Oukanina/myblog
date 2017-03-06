import is from 'is_js';
import { debounce, on, off, log } from '../core/utils';
import { CHARACTERREX, KEYMAP } from '../constants';

function isCharacter(key) {
  return CHARACTERREX.test(key);
}

function isSpecialKey(keyCode) {
  for (const k in KEYMAP) { // eslint-disable-line no-restricted-syntax
    if (KEYMAP[k] === keyCode) return true;
  }
  return false;
}

export default class InputHandler {
  constructor(handlers) {
    this.keyDownHandler = this.keyDownHandler.bind(this);
    this.handlers = handlers;
  }

  on() {
    log('bind keydown event');
    on(window, 'keydown', this.keyDownHandler());
  }

  off() {
    off(window, 'keydown', this.keyDownHandler());
  }

  runHandler(handlerName) {
    if (!this.handlers[handlerName]) return;
    if (is.not.function(this.handlers[handlerName])) return;

    this.handlers[handlerName](this.event);
  }

  keyDownHandler() {
    return debounce((event) => {
      this.event = event;
      this.characterHandler(event.key);
      this.specialKeyHandler(event.keyCode);
    }, {
      prefunc: (event) => {
        event.preventDefault();
      },
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

