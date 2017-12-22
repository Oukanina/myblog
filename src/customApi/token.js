import jwt from 'jsonwebtoken';
import { User } from '../data/models';
import { auth } from '../config';


export function createToken(email) {
  return jwt.sign({ email }, auth.jwt.secret, {
    expiresIn: auth.jwt.expires,
  });
}


export default function token(app) {
  app.post('/token', async (req, res, next) => {
    try {
      const { username, password } = req.body;
      const name = 'local:token';

      if (!username || !password) {
        res.json({ status: 'no parameters username, password!' });
        next();
        return;
      }

      let status;
      let action;
      const user = await User.findOne({
        where: { $or: {
          username, email: username,
        },
          onDelete: false },
      });

      if (!user) {
        action = 'no user';
        status = 'err';

        throw new Error(`not found ${username}`);
      }

      if (user.dataValues.password !== password) {
        action = 'vaild';
        status = 'err';

        throw new Error('wrong password');
      }

      status = 'ok';
      action = 'login';

      const logins = await user.getLogins({
        where: { name },
      });

      for (let i = 0; i < logins.length; i += 1) {
        logins[i].destroy();
      }

      const newToken = createToken(username);

      await user.createLogin({
        name, key: newToken,
      });

      res.json({ status, action, token: newToken });

      next();
    } catch (err) {
      console.error(err); // eslint-disable-line no-console
      res.json({ message: err.message });
      next();
    }
  });
}
