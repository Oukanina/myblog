/* eslint-disable class-methods-use-this, css-modules/no-unused-class */

import is from 'is_js';
import React, { PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { Line } from './Line';
import s from './style.css';
import appState from '../../core/state';
import { AT, TILDE, COLON, DOLLAR } from '../../constants';
import InputHandler from '../../handlers/InputHandler';
import InputLine from './InputLine';
import runCommand from '../../commands';
import { delayUpdate } from '../../core/utils';


const states = [
  'username', 'hostname', 'path',
  'HOME', 'cursorPosition', 'currentCommand',
  'lastLineHead',
];
// https://stackoverflow.com/questions/512528/set-keyboard-caret-position-in-html-textbox
function setCaretPosition(elem, caretPos) {
  if (elem !== null) {
    if (elem.createTextRange) {
      const range = elem.createTextRange();
      range.move('character', caretPos);
      range.select();
    } else if (elem.selectionStart) {
      elem.focus();
      elem.setSelectionRange(caretPos, caretPos);
    } else {
      elem.focus();
    }
  }
}

class LastLine extends Line {
  static propTypes = {
    hide: PropTypes.bool,
  }

  constructor(props) {
    super(props);

    this.state = {
      currentCommand: [],
      username: '...',
      hostname: '...',
      path: TILDE,
      HOME: TILDE,
      lastLineHead: '',
      cursorPosition: 1,
    };

    this.historyPointer = -1;

    this.updateLimit = 5;
    this.commandCallback = this.commandCallback.bind(this);
    this.stateHandler = this.stateHandler.bind(this);
    this.inputHandler = new InputHandler({
      characterHandler: this.insertCharacter.bind(this),
      enterHandler: this.enterHandler.bind(this),
      backspaceHandler: this.backspaceHandler.bind(this),
      leftHandler: this.leftHandler.bind(this),
      rightHandler: this.rightHandler.bind(this),
      endHandler: () => {
        appState.update(
          'cursorPosition',
          appState.get('currentCommand').length + 1,
        );
      },
      homeHandler: () => {
        appState.update('cursorPosition', 1);
      },
      upHandler: () => {
        const history = appState.get('history');
        if (this.historyPointer === -1) {
          this.historyPointer = history.length - 1;
        } else {
          this.historyPointer -= 1;
        }
        if (history.length && history[this.historyPointer]) {
          appState.update('currentCommand', history[this.historyPointer]);
          appState.update(
            'cursorPosition',
            appState.get('currentCommand').length + 1,
          );
        } else {
          appState.update('currentCommand', []);
        }
        this.syncInputValueAfterUpDown();
      },
      downHandler: () => {
        const history = appState.get('history');
        if (this.historyPointer < history.length - 1) {
          this.historyPointer += 1;
        } else {
          this.historyPointer = -1;
        }
        if (history.length && history[this.historyPointer]) {
          appState.update('currentCommand', history[this.historyPointer]);
          appState.update(
            'cursorPosition',
            appState.get('currentCommand').length + 1,
          );
        } else {
          appState.update('currentCommand', []);
        }
        this.syncInputValueAfterUpDown();
      },
    }, {
      delay: this.updateLimit,
    });

    // use shouldUpdate limit
    this.lastUpdateTime = 0;
    this.updateTimeout = null;
    this.nextState = {};
  }

  leftHandler() {
    let cursorPosition = appState.get('cursorPosition');
    if (cursorPosition > 1) cursorPosition -= 1;
    appState.update('cursorPosition', cursorPosition);
    return this;
  }

  rightHandler() {
    const currentCommand = appState.get('currentCommand');
    let cursorPosition = appState.get('cursorPosition');
    if (cursorPosition <= currentCommand.length) cursorPosition += 1;
    appState.update('cursorPosition', cursorPosition);
    return this;
  }

  backspaceHandler() {
    const currentCommand = appState.get('currentCommand');
    let cursorPosition = appState.get('cursorPosition');

    currentCommand.splice(cursorPosition - 2, 1);
    if (cursorPosition > 1) cursorPosition -= 1;
    appState.update('currentCommand', currentCommand);
    appState.update('cursorPosition', cursorPosition);
    return this;
  }

  enterHandler() {
    const currentCommand = appState.get('currentCommand');
    if (is.array(currentCommand)) {
      runCommand(currentCommand.join(''), this.commandCallback);
    } else if (is.string(currentCommand)) {
      runCommand(currentCommand, this.commandCallback);
    }
    return this;
  }

  commandCallback() {
    this.inputHandler.setValue('');
  }

  syncInputValueAfterUpDown() {
    this.inputHandler.setValue(
      appState.get('currentCommand').join(''),
    );
    setCaretPosition(
      this.inputHandler.$input,
      appState.get('currentCommand').length,
    );
  }

  insertCharacter(userInputs = '') {
    const inputs = userInputs.split('');
    const currentCommand = appState.get('currentCommand');
    let cursorPosition = appState.get('cursorPosition');
    cursorPosition += (inputs.length - currentCommand.length);

    appState.update('currentCommand', inputs);
    appState.update('cursorPosition', cursorPosition);
    return this;
  }

  stateHandler(newState, stateName) {
    this.setState(Object.assign({}, this.state, {
      [stateName]: newState,
    }));
    return this;
  }

  listenState() {
    appState.listen(states, this.stateHandler);
  }

  unlistenState() {
    appState.unlisten(states, this.stateHandler);
  }

  shouldComponentUpdate() {
    return delayUpdate.call(this,
      arguments[0], arguments[1], this.updateLimit); // eslint-disable-line prefer-rest-params
  }

  componentDidUpdate() {
    this.lastUpdateTime = Date.now();
  }

  componentDidMount() {
    this.listenState();
    this.inputHandler.on();
    appState.updateAll();
  }

  componentWillUnmount() {
    this.unlistenState();
    this.inputHandler.off();
    this.inputHandler = null;
  }

  render() {
    const { hide } = this.props;
    const {
      lastLineHead, currentCommand, HOME,
      hostname, username, path, cursorPosition,
    } = this.state;

    const pathString = path === HOME ? '~' : path;

    return this.renderLine(
      <span>
        {
          hide ? null :
          <div className={s.lineHead}>
            {
              lastLineHead ||
              `${username}${AT}${hostname}${COLON}${pathString}${DOLLAR}`
            }
          </div>
        }
        <InputLine text={currentCommand.join('')} cursorPosition={cursorPosition} />
      </span>,
    );
  }
}

export default withStyles(s)(LastLine);
