import jwt from 'jsonwebtoken';
import { User } from '../data/models';
import { auth } from '../config';

function createToken(email) {
  return jwt.sign({ email }, auth.jwt.secret, {
    expiresIn: auth.jwt.expires,
  });
}

export default function token(app) {
  app.post('/token', async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const name = 'local:token';

      if (!email || !password) {
        res.json({ status: 'no parameters! email or password' });
        return next();
      }

      let status;
      let user = await User.findOne({
        where: { email },
      });

      if (!user) {
        user = await User.create({ email, password });
        status = 'created';
      } else if (user.dataValues.password !== password) {
        status = 'vaild';
        res.json({ status });
        return next();
      } else {
        status = 'login';
        const logins = await user.getLogins({
          where: {
            name,
          },
        });
        for (let i = 0; i < logins.length; i += 1) {
          logins[i].destroy();
        }
      }

      const newToken = createToken(email);
      await user.createLogin({
        name,
        key: newToken,
      });
      res.json({ status, token: newToken });
      return next();
    } catch (err) {
      console.error(err); // eslint-disable-line no-console
      res.json({ err });
      return next();
    }
  });
}
