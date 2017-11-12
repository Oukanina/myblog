export default {

  name: 'example',

  help: '',

  test: /^\s*example\s*$/,

  action() {
    return new Promise(async (resolve, reject) => {
      try {
        // if need create a new line then pass true
        resolve(false);
      } catch (err) {
        reject(true);
      }
    });
  },
};
