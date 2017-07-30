import { User } from '../data/models';

export const NO_USERNAME_ERROR = 'PARAMETER_ERROR_NO_USERNAME';
export const NO_USER = 'ERROR_NO_USER';

const message = {
  [NO_USER]: 'not found this user',
};

export default function (app) {
  app.post('/verificationUsername', async (req, res) => {
    try {
      const { username } = req.body;
      if (!username) throw NO_USERNAME_ERROR;
      const user = await User.findOne({
        where: { username, onDelete: false },
      });
      if (!user) throw NO_USER;
      res.json({ status: 'ok' });
    } catch (e) {
      res.json({
        status: 'err',
        message: message[e] || '',
        e,
      });
    }
  });
}
