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

  path: '/read/:fileId',

  async action({ params }) {
    try {
      const { fileId } = params;
      if (!fileId) return { redirct: './notFound' };
      const res = await fetch(`/file/${fileId}`)
        .catch(err => console.error(err)); // eslint-disable-line
      let json = null;

      json = await res.json();

      if (!json.content) {
        return {
          redirect: '/notFound',
        };
      }
      if (json.redirect) {
        return {
          redirect: json.content,
        };
      }

      const frontmatter = fm(json.content || '');
      frontmatter.attributes.html = md.render(frontmatter.body);

      if (!frontmatter.attributes.title) {
        frontmatter.attributes.title =
          frontmatter.body.substring(0, 10);
      }

      return {
        title: frontmatter.attributes.title,
        chunk: 'article',
        component: (
          <Layout>
            <Page {...frontmatter.attributes}>
              { null }
            </Page>
          </Layout>
        ),
      };
    } catch (err) {
      throw err;
    }
  },

};
