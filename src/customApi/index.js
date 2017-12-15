/* eslint-disable global-require, import/no-dynamic-require */

const fetchApiList = [
  'me', 'istoken', 'token', 'verificationUsername',
  'article',
];

export default {
  initial(app) {
    this.children = [];

    for (let i = 0; i < fetchApiList.length; i += 1) {
      this.children.push(require(`./${fetchApiList[i]}`).default);
    }
    for (let i = 0; i < this.children.length; i += 1) {
      this.children[i](app);
    }

    return this;
  },

};
