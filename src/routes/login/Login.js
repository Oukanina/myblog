/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React from 'react';
import cx from 'classnames';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import Lockr from 'lockr';

import s from './Login.css';
import Cursor from '../../components/Cursor';
import { CHARACTERREX, SPECIALKEY } from '../../constants';
import { debounce, on, off, delayUpdate } from '../../core/utils';
import { isToken, apiVerificationUsername, token, ERR_401 } from '../../core/api';
import history from '../../core/history';
import appState from '../../core/state';


const Tab = 'Tab';
const Enter = 'Enter';
const Escape = 'Escape';
// const ArrowUp = 'ArrowUp';
const Backspace = 'Backspace';
// const ArrowDown = 'ArrowDown';
const ArrowLeft = 'ArrowLeft';
const ArrowRight = 'ArrowRight';

// const ERR_AUTH_ERROR = new Error('auth error!');

async function checkToken() {
  try {
    const userToken = Lockr.get('token');
    if (!userToken) {
      appState.update('login', false);
      return;
    }

    const res = await isToken();
    const json = await res.json();
    if (json.status !== 'ok') {
      appState.update('login', false);
      return;
    }
    appState.update('login', true);
    history.push('/');
  } catch (err) {
    if (err === ERR_401) {
      appState.update('login', false);
    }
  }
}

function isCharacter(key) {
  return CHARACTERREX.test(key);
}

function isSpecialKey(key) {
  return SPECIALKEY.test(key);
}

function isEmail() {
  return true;
}

class Login extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      username: [],
      password: [],
      usernameValid: false,
      isPending: false,
      isError: false,
      errorText: '',
      usernameFocus: true,
      passwordFocus: false,
      cursorPosition: 1,
      // if component render from server, then set login true
      login: true,
    };

    this.listenHandler = this.listenHandler.bind(this);
    this.keydownHandler = this.keydownHandler.bind(this);

    // use shouldUpdate limit
    this.lastUpdateTime = 0;
    this.updateTimeout = null;
    this.nextState = {};
  }

  componentDidMount() {
    this.listen();
    on(window, 'keydown', this.keydownHandler());
    checkToken();
  }

  shouldComponentUpdate() {
    return delayUpdate.call(this,
      arguments[0], arguments[1], 200); // eslint-disable-line prefer-rest-params
  }

  componentWillUnmount() {
    off(window, 'keydown', this.keydownHandler());
    this.unlisten();
  }

  listen() {
    appState.listen('login', this.listenHandler);
  }

  unlisten() {
    appState.unlisten('login', this.listenHandler);
  }

  listenHandler(login) {
    this.setState({ login });
  }

  keydownHandler() {
    return debounce((event) => {
      this.characterHandler(event);
      this.specialKeyHandler(event);
    }, {
      prefunc(event) {
        if (!event.ctrlKey && !event.altKey) {
          event.preventDefault();
        }
      },
    });
  }

  toogleFocus() {
    const { usernameFocus, passwordFocus, username, password } = this.state;
    if (passwordFocus) {
      this.setState({
        ...this.state,
        username: [],
        usernameValid: false,
      });
    }
    this.setState({
      ...this.state,
      usernameFocus: passwordFocus,
      passwordFocus: usernameFocus,
      cursorPosition: usernameFocus ? password.length + 1 : username.length + 1,
    });
  }

  backspace() {
    this.hideError();
    const { usernameFocus, cursorPosition, username, password } = this.state;
    let newEmail = username; // eslint-disable-line prefer-const
    let newPasswod = password; // eslint-disable-line prefer-const
    if (usernameFocus) {
      if (newEmail[cursorPosition - 2]) newEmail.splice(cursorPosition - 2, 1);
    } else if (newPasswod[cursorPosition - 2]) newPasswod.splice(cursorPosition - 2, 1);

    this.setState(Object.assign({}, this.state, {
      user: newEmail,
      password: newPasswod,
      cursorPosition: cursorPosition > 1 ? cursorPosition - 1 : cursorPosition,
    }));
  }

  cursorPositionAdd(direction) {
    const { usernameFocus, cursorPosition, username, password } = this.state;
    const newPosition = cursorPosition + direction;
    if (newPosition < 1) return;
    if (newPosition > (usernameFocus ? username.length + 1 : password.length + 1)) return;

    this.setState(Object.assign({}, this.state, {
      cursorPosition: newPosition,
    }));
  }

  clearCurrentInput() {
    const { usernameFocus } = this.state;
    if (usernameFocus) {
      this.setState(Object.assign({}, this.state, {
        username: [],
        cursorPosition: 1,
      }));
    } else {
      this.setState(Object.assign({}, this.state, {
        password: [],
        cursorPosition: 1,
      }));
    }
  }

  async enterHandler() {
    const { usernameFocus, passwordFocus } = this.state;
    try {
      if (usernameFocus) {
        this.verificationUsername();
      }
      if (passwordFocus) {
        this.verificationPassword();
      }
    } catch (err) {
      console.error(err); // eslint-disable-line no-console
    }
  }

  pending() {
    this.hideError();
    this.setState({
      isPending: true,
    });
  }

  unpending() {
    this.setState({
      isPending: false,
    });
  }

  async verificationUsername() {
    const { username } = this.state;
    this.pending();
    const resp = await apiVerificationUsername(username.join(''));
    const json = await resp.json();

    if (json.status === 'ok') {
      this.verificationUsernameSuccess();
    } else {
      this.verificationUsernameFailed(json);
    }
    this.unpending();
  }

  verificationUsernameSuccess() {
    this.toogleFocus();
    this.setState({
      usernameValid: true,
    });
  }

  verificationUsernameFailed(json) { // eslint-disable-line
    this.showError(json.message);
  }

  async verificationPassword() {
    const { username, password } = this.state;
    this.pending();
    const resp = await token({
      username: username.join(''),
      password: password.join(''),
    });
    const json = await resp.json();
    if (json.status === 'ok') {
      this.verificationPasswordSuccess(json);
    } else {
      this.verificationPasswordFailed(json);
    }
    this.unpending();
  }

  verificationPasswordSuccess(json) { // eslint-disable-line
    Lockr.set('token', json.token || '');
    appState.set('login', true);
    appState.set('showLoginInfo', true);
    appState.fetchData({ force: true });
    history.push('/');
  }

  verificationPasswordFailed(json) { // eslint-disable-line
    this.showError(json.message);
  }

  showError(text) {
    this.setState({
      isError: true,
      errorText: text,
    });
  }

  hideError() {
    if (this.state.isError) {
      this.setState({
        isError: false,
        errorText: '',
      });
    }
  }

  specialKeyHandler(event) {
    if (!isSpecialKey(event.key)) return;
    switch (event.key) {
      case Tab:
        if (this.state.usernameValid) this.toogleFocus();
        break;
      case ArrowLeft:
        this.cursorPositionAdd(-1);
        break;
      case ArrowRight:
        this.cursorPositionAdd(1);
        break;
      case Backspace:
        this.backspace();
        break;
      case Enter:
        this.enterHandler();
        break;
      case Escape:
        this.clearCurrentInput();
        break;
      default:
        break;
    }
  }

  characterHandler(event) {
    if (!isCharacter(event.key)) return;
    const { usernameFocus, cursorPosition } = this.state;
    const { username, password } = this.state;
    this.hideError();
    if (usernameFocus) {
      username.splice(cursorPosition - 1, 0, event.key);
      if (!isEmail(username.join(''))) {
        // todo
        return;
      }
    } else {
      password.splice(cursorPosition - 1, 0, event.key);
    }

    this.setState({
      username,
      password,
      cursorPosition: cursorPosition + 1,
    });
  }

  renderText(textArray, focus, ishide = false) {
    const { cursorPosition } = this.state;
    if (ishide) {
      return (
        <span>
          {
            focus ? <Cursor blink={(textArray.length < 1)} /> : null
          }
        </span>
      );
    }

    return (
      <span>
        {
          textArray.map((value, index) => (
            <span
              className={focus && cursorPosition - 1 === index ?
                cx(s.oncursor, s.e) : s.e}
              key={index.toString()}
            >
              {value}
            </span>))
        }
        {
          focus && textArray.length < cursorPosition ?
            <Cursor /> : null
        }
      </span>
    );
  }

  renderUsername() {
    const { username, usernameFocus } = this.state;
    return (<div>
      {this.renderText(username, usernameFocus)}
    </div>);
  }

  renderPassword() {
    const { password, passwordFocus } = this.state;
    return (
      <div>
        {this.renderText(password, passwordFocus, true)}
        {
          password.length === 0
            ? <span className={s.placeholder}> anon </span>
            : null
        }
      </div>
    );
  }

  renderUsernameBox() {
    return this.renderContainer(
      <div className={s.formGroup}>
        <label className={s.label} htmlFor="usernameOrEmail">
          Login as:
        </label>
        <div
          className={s.input}
          ref={(u) => { this.usernameInput = u; }}
        >
          { this.renderUsername() }
          {
            this.state.username.length === 0
              ? <span className={s.placeholder}> anon </span>
              : null
          }
        </div>
      </div>);
  }

  renderPasswordBox() {
    return this.renderContainer(
      <div className={s.formGroup}>
        <label className={s.label} htmlFor="password">
        Password:
        </label>
        <div
          className={s.input}
          ref={(p) => { this.passwordInput = p; }}
        >
          {this.renderPassword()}
        </div>
      </div>);
  }

  renderContainer(children) { // eslint-disable-line
    const { isPending, isError, errorText } = this.state;
    const containerClass = isPending ? cx(s.container, s.pending) : s.container;

    return (
      <div className={s.root}>
        <div className={containerClass}>
          { isError && <span className={s.errorText}> { errorText } </span> }
          {children}
        </div>
      </div>
    );
  }

  render() {
    const { login, usernameFocus, passwordFocus } = this.state;
    if (login) return null;
    if (usernameFocus) return this.renderUsernameBox();
    if (passwordFocus) return this.renderPasswordBox();
    return null;
  }
}

export default withStyles(s)(Login);
