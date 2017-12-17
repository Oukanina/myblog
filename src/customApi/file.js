import fs from 'fs';
import { dataDir } from '../config.js';
import { File, User, LINKTO } from '../data/models';

function readFile(name) {
  return new Promise((resolve, reject) => {
    fs.readFile(`${dataDir}/${name}`, (err, data) => {
      if (err) return reject(err);
      return resolve(data);
    });
  });
}

export default function (app) {
  app.get('/file/:fileId',
    async (req, res) => {
      const { fileId } = req.params;

      if (!fileId) throw new Error('no id parameter when call file resolve!');

      const file = await File.findOne({
        where: {
          id: fileId,
        },
      });


      if (!file) {
        return res.json({ content: null });
      }

      const ext = file.name.split('.').pop();
      const path = `${file.id}.${ext}`;

      if (file.linkTo === LINKTO.article) {
        const content = await readFile(path);
        return res.json({
          type: LINKTO.article,
          content: content.toString(),
        });
      }
      if (file.linkTo === LINKTO.image) {
        return res.json({
          redirect: true,
          content: `/${path}`,
        });
      }
      // if (file.linkTo === LINKTO.music) {
      // }
      // if (file.linkTo === LINKTO.video) {
      // }

      return res.json({ content: null });
    });

  app.get('/articles', async (req, res) => {
    const articles = await File.findAll({
      attributes: ['id', 'name', 'owner.email', 'onCreate'],
      where: {
        linkTo: LINKTO.articles,
      },
      include: [{
        attributes: ['email'],
        model: User,
        as: 'owner',
        required: true,
      }],
    });

    const r = [];

    articles.forEach((f) => {
      r.push({
        id: f.id,
        name: f.name,
        owner: f.owner.email,
        onCreate: f.onCreate,
      });
    });

    return res.json({ files: r });
  });
}
