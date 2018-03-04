import history from '../core/history';

export default {

  name: 'list',

  help: 'List my articles, emmm..., maybe nothing...',

  test: /^\s*list\s+?$/,

  action() {
    return new Promise((resolve, reject) => {
      try {
        history.push('/list');
        // if need goAhead then pass true
        resolve(true);
      } catch (err) {
        reject(true);
      }
    });
  },
};
