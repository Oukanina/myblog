import history from '../core/history';

export default {

  name: 'navigation',

  help: '导航',

  test: /^\s*navigation\s*$/,

  action() {
    return new Promise((resolve, reject) => {
      try {
        history.push('/navigation');
        // if need goAhead then pass true
        resolve(true);
      } catch (err) {
        reject(true);
      }
    });
  },
};
