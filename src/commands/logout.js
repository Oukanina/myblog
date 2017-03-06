import Lockr from 'lockr';
import history from '../core/history';


export default {
  test: /^\s*logout\s*$/,

  action() {
    return new Promise((resolve) => {
      Lockr.set('token', '');
      history.push('/login');
      // if need goAhead then pass true
      resolve(false);
    });
  },
};
