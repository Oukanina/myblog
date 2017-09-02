/* eslint-disable class-methods-use-this, css-modules/no-unused-class */

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


const states = ['username', 'hostname', 'path',
  'cursorPosition', 'currentCommand', 'lastLineHead'];

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
      lastLineHead: '',
      cursorPosition: 1,
    };

    this.updateLimit = 0;
    this.stateHandler = this.stateHandler.bind(this);
    this.inputHandler = new InputHandler({
      characterHandler: this.characterHandler.bind(this),
      enterHandler: this.enterHandler.bind(this),
      backspaceHandler: this.backspaceHandler.bind(this),
      spaceHandler: this.spaceHandler.bind(this),
      leftHandler: this.leftHandler.bind(this),
      rightHandler: this.rightHandler.bind(this),
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
    runCommand(currentCommand.join(''));
    return this;
  }

  characterHandler(event) {
    this.insertCharacter(event.key);
    return this;
  }

  spaceHandler() {
    this.insertCharacter(' ');
    return this;
  }

  insertCharacter(Code) {
    const currentCommand = appState.get('currentCommand');
    let cursorPosition = appState.get('cursorPosition');

    currentCommand.splice(cursorPosition - 1, 0, Code);
    cursorPosition += 1;
    appState.update('currentCommand', currentCommand);
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
    const { lastLineHead, currentCommand,
      hostname, username, path, cursorPosition } = this.state;

    return this.renderLine(
      <span>
        {
          hide ? null :
          <div className={s.lineHead}>
            { lastLineHead || `${username}${AT}${hostname}${COLON}${path}${DOLLAR}` }
          </div>
        }
        <InputLine text={currentCommand.join('')} cursorPosition={cursorPosition} />
      </span>,
    );
  }
}

export default withStyles(s)(LastLine);
