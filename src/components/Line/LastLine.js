/* eslint-disable class-methods-use-this */

import React, { PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { Line } from './Line';
import s from './Line.css';
import appState from '../../core/state';
import { AT, TILDE, COLON, DOLLAR } from '../../constants';
import InputHandler from '../../handlers/InputHandler';
import runCommand from '../../commands';
import Cursor from '../Cursor';
import { delayUpdate } from '../../core/utils';


const states = ['username', 'hostname', 'path',
  'cursorPosition', 'currentCommand'];

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
      cursorPosition: 1,
    };

    this.updateLimit = 50;
    this.stateHandler = this.stateHandler.bind(this);
    this.inputHandler = new InputHandler({
      characterHandler: this.characterHandler.bind(this),
      enterHandler: this.enterHandler.bind(this),
      backspaceHandler: this.backspaceHandler.bind(this),
      leftHandler: this.leftHandler.bind(this),
      rightHandler: this.rightHandler.bind(this),
    }, {
      deplay: this.updateLimit,
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
  }

  rightHandler() {
    const currentCommand = appState.get('currentCommand');
    let cursorPosition = appState.get('cursorPosition');
    if (cursorPosition <= currentCommand.length) cursorPosition += 1;
    appState.update('cursorPosition', cursorPosition);
  }

  backspaceHandler() {
    const currentCommand = appState.get('currentCommand');
    let cursorPosition = appState.get('cursorPosition');

    currentCommand.splice(cursorPosition - 2, 1);
    if (cursorPosition > 1) cursorPosition -= 1;
    appState.update('currentCommand', currentCommand);
    appState.update('cursorPosition', cursorPosition);
  }

  enterHandler() {
    const currentCommand = appState.get('currentCommand');
    runCommand(currentCommand.join(''));
  }

  characterHandler(event) {
    const currentCommand = appState.get('currentCommand');
    let cursorPosition = appState.get('cursorPosition');

    currentCommand.splice(cursorPosition - 1, 0, event.key);
    cursorPosition += 1;
    appState.update('currentCommand', currentCommand);
    appState.update('cursorPosition', cursorPosition);
  }

  stateHandler(newState, stateName) {
    const n = {};
    n[stateName] = newState;
    this.setState(Object.assign({}, this.state, n));
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
    const { hostname, username, path, currentCommand, cursorPosition } = this.state;

    return this.renderLine(
      <span>
        {
          hide ? null : <div className={s.lineHead}>
            { `${username}${AT}${hostname}${COLON}${path}${DOLLAR}` }
          </div>
        }
        { this.print(currentCommand, cursorPosition) }
        { cursorPosition <= currentCommand.length ? null : <Cursor /> }
      </span>,
    );
  }
}

export default withStyles(s)(LastLine);
