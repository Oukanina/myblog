
/* eslint-disable global-require */

const websocketWokers = [
  require('./upload.js').default,
];

export default {

  install(app) {
    websocketWokers.forEach((wk) => {
      wk(app);
    });
  },

};
