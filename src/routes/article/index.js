/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React from 'react';
import MarkdownIt from 'markdown-it';
import fm from 'front-matter';
import Layout from '../../components/Layout';
import Page from '../../components/Page';
import fetch from '../../core/fetch';

const md = new MarkdownIt({
  html: true,
  linkify: true,
});

export default {

  path: '/article/:articleId',

  async action({ params }) {
    const { articleId } = params;
    if (!articleId) return { redirct: './notFound' };

    const res = await fetch(`/graphql?query={
      article(id: "${articleId}") {
        content, error
      }
    }`).catch(err => console.error(err)); // eslint-disable-line no-console

    const json = await res.json();

    if (json.errors) {
      return {
        redirect: '/notFound',
      };
    }

    const frontmatter = fm(json.data.article.content);
    frontmatter.attributes.html = md.render(frontmatter.body);

    if (!frontmatter.attributes.title) {
      frontmatter.attributes.title = frontmatter.body.substring(0, 10);
    }

    return {
      title: frontmatter.attributes.title,
      chunk: 'article',
      component: <Layout><Page {...frontmatter.attributes}> { null } </Page></Layout>,
    };
  },

};
