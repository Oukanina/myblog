import React from 'react';
// import ReactDOM from 'react-dom/server';
import fetch from '../../core/fetch';
import Screen from '../../components/Screen';
import LinkList from '../../components/LinkList';
import Page from '../../components/Page';

export default {

  path: '/list',

  async action() {
    try {
      const res = await fetch('/articles')
        .catch(err => console.error(err)); // eslint-disable-line no-console
      const json = await res.json();

      return {
        title: 'Navigation',
        chunk: 'navigation',
        component: (
          <Screen cover={false}>
            <Page title={'Blog'} html={''}>
              <LinkList files={json.articles || []} />
            </Page>
          </Screen>
        ),
      };
    } catch (err) {
      return {
        redirect: '/error',
      };
    }
  },
};
