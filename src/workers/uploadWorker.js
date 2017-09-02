
import { UPLOAD_STATUS } from '../constants';

let protocol;
if (process.env.NODE_ENV === 'development') {
  protocol = 'ws';
} else {
  protocol = 'wss';
}

function errorHandler(err) {
  throw err;
}

function createWebSoket(url) {
  const ws = new WebSocket(url);
  ws.onerror = errorHandler;
  return ws;
}

function FileSlice(file) {
  const size = (1 << 20); // eslint-disable-line
  const slices = Math.ceil(file.size / size);
  let start = 0;

  this.next = () => {
    if (start >= slices) return null;
    return file.slice((start++) * size, start * size); // eslint-disable-line no-plusplus
  };

  return this;
}

function startUpload(ws, file, token, path) {
  return new Promise((resolve, reject) => {
    try {
      console.log('startUpload') // eslint-disable-line
      const { name, size, type, lastModified } = file;
      ws.onopen = () => { // eslint-disable-line no-param-reassign
        ws.send(JSON.stringify({
          action: UPLOAD_STATUS.VERIFICATION,
          file: { name, size, type, lastModified },
          token,
          path,
        }));
      };
      ws.onmessage = (message) => { // eslint-disable-line no-param-reassign
        resolve(JSON.parse(message.data));
        ws.close();
      };
    } catch (err) {
      reject(err);
    }
  });
}

function sendFileData(uploadWs, file) {
  return new Promise((resolve, reject) => {
    try {
      const fileSlice = new FileSlice(file);
      let data = fileSlice.next();

      uploadWs.onmessage = (message) => { // eslint-disable-line no-param-reassign
        const status = message.data === '100' ? 'finish' : 'progress';
        postMessage(JSON.stringify({
          status,
          progress: message.data,
          name: file.name,
        }));
        if (status === 'finish') {
          uploadWs.close();
          resolve();
        }
      };

      uploadWs.onopen = () => { // eslint-disable-line no-param-reassign
        const loop = () => {
          if (data) {
            uploadWs.send(data);
            data = fileSlice.next();
            setTimeout(loop, 0);
          }
        };
        loop();
      };
    } catch (err) {
      reject(err);
    }
  });
}

onmessage = (event) => { // eslint-disable-line no-undef
  const { file, host, token, path } = event.data;
  const ws = createWebSoket(`${protocol}://${host}/ws/upload`);

  startUpload(ws, file, token, path)
  .then((data) => {
    if (data.status !== 'success') {
      throw data;
    }
    sendFileData(createWebSoket(
      `${protocol}://${host}/${data.path}`), file)
    .catch(err => console.error(err)); // eslint-disable-line no-console
  })
  .catch((err) => {
    console.error(err); // eslint-disable-line
    postMessage(JSON.stringify({
      status: 'error',
      data: err.data.trim(),
    }));
    ws.close();
    console.error(err); // eslint-disable-line no-console
  });
};
