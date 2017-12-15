import fs from 'fs';
import { dataDir } from '../config.js';
import { File, User } from '../data/models';

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

  app.get('/articles', async (req, res) => {
    const files = await File.findAll({
      attributes: ['id', 'name', 'owner.email', 'onCreate'],
      where: {
        linkTo: 'article',
      },
      include: [{
        attributes: ['email'],
        model: User,
        as: 'owner',
        required: true,
      }],
    });

    const articles = files.map(file => ({
      id: file.id,
      name: file.name,
      owner: file.owner.email,
      onCreate: file.onCreate,
    }));

    return res.json({ articles });
  });
}
