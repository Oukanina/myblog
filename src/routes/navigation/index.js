import React from 'react';
// import ReactDOM from 'react-dom/server';
import fetch from '../../core/fetch';
import Screen from '../../components/Screen';
import { LinkList } from '../../components/LinkList';
import Page from '../../components/Page';

export default {

  path: '/navigation',

  async action() {
    const res = await fetch(`/graphql?query={
      articleList {
        articles {
          id
          owner
          name
          onCreate
        }
      }
    }`).catch(err => console.error(err)); // eslint-disable-line no-console
    const json = await res.json();

    return {
      title: 'Navigation',
      chunk: 'navigation',
      component: (
        <Screen cover={false}>
          <Page title={'Blog'} html={''}>
            <LinkList files={json.data.articleList.articles} />
          </Page>
        </Screen>
      ),
    };
  },

};
