/* eslint-disable class-methods-use-this, css-modules/no-unused-class */

import is from 'is_js';
import _path from 'path';
import React, { PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { Line } from './Line';
import s from './style.css';
import appState from '../../core/state';
import { AT, TILDE, COLON, DOLLAR } from '../../constants';
import InputHandler from '../../handlers/InputHandler';
import InputLine from './InputLine';
import runCommand, { addCurrentCommandToHistory, printError } from '../../commands';
import { delayUpdate } from '../../core/utils';
import { getFolderChildren, listFile } from '../../commands/ls';


const states = [
  'username', 'hostname', 'path',
  'HOME', 'cursorPosition', 'currentCommand',
  'lastLineHead', 'lockCommand',
];
// https://stackoverflow.com/questions/512528/set-keyboard-caret-position-in-html-textbox
function setCaretPosition(elem, caretPos) {
  if (elem !== null) {
    if (elem.createTextRange) {
      const range = elem.createTextRange();
      range.move('character', caretPos);
      range.select();
    } else if (elem.selectionStart) {
      if (elem.focus instanceof Function) elem.focus();
      elem.setSelectionRange(caretPos, caretPos);
    } else if (elem.focus instanceof Function) {
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
      lockCommand: false,
    };

    this.historyPointer = -1;
    this.updateLimit = 0;
    this.commandCallback = this.commandCallback.bind(this);
    this.stateHandler = this.stateHandler.bind(this);
    this.inputHandler = new InputHandler({
      characterHandler: this.insertCharacter.bind(this),
      enterHandler: this.enterHandler.bind(this),
      backspaceHandler: this.backspaceHandler.bind(this),
      leftHandler: this.leftHandler.bind(this),
      rightHandler: this.rightHandler.bind(this),
      tabHandler: this.tabHandler.bind(this),
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

  async tabHandler() {
    const { currentCommand, cursorPosition } = appState;

    if (!currentCommand.length) return;

    const r = [];
    let inputStr = '';
    let cp = cursorPosition - 2;

    while (currentCommand[cp] && currentCommand[cp] !== ' ') {
      inputStr = currentCommand[cp] + inputStr;
      cp -= 1;
    }

    const folders = inputStr.split('/');

    if (folders.length > 1) {
      if (folders[folders.length - 1]) {
        folders.pop();
      }
    }
    if (folders.length === 1) {
      if (!(folders[0].endsWith('/') || folders[0].startsWith('..'))) {
        folders.pop();
      }
    }

    appState.update('lockCommand', true);

    const folderPath = _path.resolve(
      appState.getPath(),
      folders.join('/'),
    );
    const json = await getFolderChildren(folderPath);

    appState.update('lockCommand', false);

    if (json.errors && json.errors.length) {
      addCurrentCommandToHistory(true);
      printError(json.errors);
      return;
    } else if (!json.data.ls.children) {
      return;
    }

    for (let i = 0; i < json.data.ls.children.length; i += 1) {
      const file = json.data.ls.children[i];

      if (file.name.startsWith(inputStr.split('/').pop())) {
        r.push(file);
      }
    }

    if (r.length < 1) {
      if (folders.length === 0 && json.data.ls.children.length > 0) {
        addCurrentCommandToHistory(true);
        listFile(json.data.ls.children);
      }
      return;
    }
    if (r.length === 1) {
      let resultCommand;
      const cstart = currentCommand.slice(0, cp + 1);
      const cpath = r[0].path.split('');

      if (r[0].type === 'd') {
        r[0].path += '/';
        resultCommand = [
          ...cstart,
          ...cpath,
          ...currentCommand.slice(cursorPosition - 1, currentCommand.length),
        ];
      } else if (r[0].path === `${appState.get('path')}/${r[0].name}`) {
        resultCommand = [
          ...cstart,
          ...r[0].name.split(''),
        ];
      } else {
        resultCommand = [
          ...cstart,
          ...cpath,
        ];
      }

      appState.update('currentCommand', resultCommand);
      this.setValue(resultCommand.join(''));
      appState.update('cursorPosition', resultCommand.length + 1);
      setCaretPosition(resultCommand.length + 1);
    } else {
      addCurrentCommandToHistory(true);
      appState.update('cursorPosition', appState.currentCommand.length + 1);
      listFile(r);
    }
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
    this.setValue('');
  }

  setValue(value) {
    if (this.inputHandler) {
      this.inputHandler.setValue(value);
    }
  }

  syncInputValueAfterUpDown() {
    this.setValue(
      appState.get('currentCommand').join(''),
    );
    if (this.inputHandler.$input) {
      setCaretPosition(
        this.inputHandler.$input,
        appState.get('currentCommand').length,
      );
    }
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
    if (stateName === 'lockCommand') {
      if (newState) {
        this.inputHandler.pause();
      } else {
        this.inputHandler.resume();
      }
    }
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
      lockCommand,
    } = this.state;

    const pathString = path === HOME ? '~' : path;
    const text = currentCommand.join ? currentCommand.join('') : currentCommand;

    return this.renderLine(
      <span className={lockCommand ? s.lock : null}>
        {
          hide ? null :
          <div className={s.lineHead}>
            {
              lastLineHead ||
              `${username}${AT}${hostname}${COLON}${pathString}${DOLLAR}`
            }
          </div>
        }
        <InputLine
          text={text}
          cursorPosition={cursorPosition}
        />
      </span>,
    );
  }
}

export default withStyles(s)(LastLine);
