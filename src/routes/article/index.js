/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React from 'react';
import Screen from '../../components/Screen';
import Page from '../../components/Page';

export default {

  path: '/article/:articleId',

  async action({ params }) {
    const { articleId } = params;
    if (!articleId) return { redirct: './notFound' };

    const data = await require.ensure([],
      require => require('./privacy.md'), 'privacy');

    return {
      title: data.title,
      chunk: 'privacy',
      component: <Screen><Page {...data} /></Screen>,
    };
  },

};
