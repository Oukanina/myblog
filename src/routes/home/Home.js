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
  componentDidMount() {
    appState.fetchData();
  }

  render() {
    return (<CommandLine />);
  }
}

export default Home;
