import fs from 'fs';
import { dataDir } from '../config.js';

function readFile(name) {
  return new Promise((resolve, reject) => {
    fs.readFile(`${dataDir}/${name}.md`, (err, data) => {
      if (err) return reject(err);
      return resolve(data);
    });
  });
}

export default function article(app) {
  app.get('/article/:articleId',
    async (req, res) => {
      const { articleId } = req.params;

      if (!articleId) throw new Error('no id parameter when call article resolve!');

      const content = await readFile(articleId);

      res.json({
        content: content.toString(),
      });
    });
}
