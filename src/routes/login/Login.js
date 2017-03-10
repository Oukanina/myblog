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
import { isToken, token, ERR_401 } from '../../core/api';
import history from '../../core/history';
import appState from '../../core/state';


const Tab = 'Tab';
const Enter = 'Enter';
const Escape = 'Escape';
const ArrowUp = 'ArrowUp';
const Backspace = 'Backspace';
const ArrowDown = 'ArrowDown';
const ArrowLeft = 'ArrowLeft';
const ArrowRight = 'ArrowRight';

const ERR_RETURN_TOKEN = new Error('not return token!');

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
      email: [],
      password: [],
      username: [],
      emailFocus: true,
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
        event.preventDefault();
      },
    });
  }

  toogleFocus() {
    const { emailFocus, passwordFocus, email, password } = this.state;

    if (emailFocus) this.passwordInput.focus();
    if (passwordFocus) this.emailInput.focus();

    this.setState(Object.assign({}, this.state, {
      emailFocus: passwordFocus,
      passwordFocus: emailFocus,
      cursorPosition: emailFocus ? password.length + 1 : email.length + 1,
    }));
  }

  backspace() {
    const { emailFocus, cursorPosition, email, password } = this.state;
    let newEmail = email; // eslint-disable-line prefer-const
    let newPasswod = password; // eslint-disable-line prefer-const

    if (emailFocus) {
      if (newEmail[cursorPosition - 2]) newEmail.splice(cursorPosition - 2, 1);
    } else if (newPasswod[cursorPosition - 2]) newPasswod.splice(cursorPosition - 2, 1);

    this.setState(Object.assign({}, this.state, {
      email: newEmail,
      password: newPasswod,
      cursorPosition: cursorPosition > 1 ? cursorPosition - 1 : cursorPosition,
    }));
  }

  cursorPositionAdd(direction) {
    const { emailFocus, cursorPosition, email, password } = this.state;
    const newPosition = cursorPosition + direction;
    if (newPosition < 1) return;
    if (newPosition > (emailFocus ? email.length + 1 : password.length + 1)) return;

    this.setState(Object.assign({}, this.state, {
      cursorPosition: newPosition,
    }));
  }

  clearCurrentInput() {
    const { emailFocus } = this.state;
    if (emailFocus) {
      this.setState(Object.assign({}, this.state, {
        email: [],
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
    const { email, password } = this.state;
    try {
      const resp = await token({
        method: 'post',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.join(''),
          password: password.join(''),
        }),
      });
      const json = await resp.json();
      if (json.stauts === 'vaild') return; //
      if (!json.token) throw ERR_RETURN_TOKEN;
      Lockr.set('token', json.token || '');
      appState.set('login', true);
      appState.fetchData();
      history.push('/');
    } catch (err) {
      console.error(err); // eslint-disable-line no-console
    }
  }

  specialKeyHandler(event) {
    if (!isSpecialKey(event.key)) return;
    switch (event.key) {
      case Tab:
      case ArrowUp:
      case ArrowDown:
        this.toogleFocus();
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
    const { emailFocus, cursorPosition } = this.state;
    const { email, password } = this.state;

    if (emailFocus) {
      email.splice(cursorPosition - 1, 0, event.key);
      if (!isEmail(email.join(''))) {
        // todo
        return;
      }
    } else {
      password.splice(cursorPosition - 1, 0, event.key);
    }

    this.setState({
      email,
      password,
      cursorPosition: cursorPosition + 1,
    });
  }

  renderText(textArray, focus, ishide = false) {
    const { cursorPosition } = this.state;
    return (<span>
      {
        ishide ? null : textArray.map((value, index) => (
          <e
            className={focus && cursorPosition - 1 === index ?
              cx(s.oncursor, s.e) : s.e}
            key={index.toString()}
          >
            {value}
          </e>))
      }
      {
        focus && textArray.length < cursorPosition ?
          <Cursor /> : null
      }
    </span>);
  }

  renderInputEmail() {
    const { email, emailFocus } = this.state;
    return (<div>
      {this.renderText(email, emailFocus)}
    </div>);
  }

  renderInputPassword() {
    const { password, passwordFocus } = this.state;
    return (<div>
      {this.renderText(password, passwordFocus, true)}
    </div>);
  }

  // renderInputUsername() {
  //   const { username } = this.state;
  //   return (
  //     <div>
  //       { this.renderText(username, truem) }
  //     </div>)
  // }

  render() {
    const { login } = this.state;
    if (login) return null;

    return (
      <div className={s.root}>
        <div className={s.container}>
          <div className={s.formGroup}>
            <label className={s.label} htmlFor="usernameOrEmail">
              Email:
            </label>
            <div
              className={s.input}
              ref={(u) => { this.emailInput = u; }}
            >
              {this.renderInputEmail()}
            </div>
          </div>
          <div className={s.formGroup}>
            <label className={s.label} htmlFor="password">
              Password:
            </label>
            <div
              className={s.input}
              ref={(p) => { this.passwordInput = p; }}
            >
              {this.renderInputPassword()}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default withStyles(s)(Login);
