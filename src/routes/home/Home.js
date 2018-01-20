/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React from 'react';
import CommandLine from '../../components/CommandLine';
import appState from '../../core/state';


class Home extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      login: false,
    };

    this.listenHandler = this.listenHandler.bind(this);
  }

  componentDidMount() {
    this.listen();
    this.listenHandler(appState.get('login'));
  }

  componentWillUnmount() {
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

  render() {
    const { login } = this.state;

    return (
      <div>
        { login ? <CommandLine /> : null }
      </div>
    );
  }
}

export default Home;
