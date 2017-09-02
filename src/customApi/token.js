import jwt from 'jsonwebtoken';
import { User } from '../data/models';
import { auth } from '../config';
// import { createUser } from '../data/utils/userUtils';
// import { setUserGroup } from '../data/utils/groupUtils';


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
        return next();
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
        // const userCount = await User.count({
        //   onDelete: false,
        // });
        // user = await createUser({ username, password });
        // if (userCount === 0) {
        //   await setUserGroup(user, await UserGroup.findOne({
        //     where: { name: 'root' },
        //   }));
        // } else {
        //   await setUserGroup(user, await UserGroup.findOne({
        //     where: { name: 'user' },
        //   }));
        // }
        // action = 'created';
        action = 'no user';
        status = 'err';
      } else if (user.dataValues.password !== password) {
        action = 'vaild';
        status = 'err';
        res.json({ status });
        return next();
      } else {
        status = 'ok';
        action = 'login';
        const logins = await user.getLogins({
          where: { name },
        });
        for (let i = 0; i < logins.length; i += 1) {
          logins[i].destroy();
        }
      }

      const newToken = createToken(username);
      await user.createLogin({
        name, key: newToken,
      });
      res.json({ status, action, token: newToken });
      return next();
    } catch (err) {
      console.error(err); // eslint-disable-line no-console
      res.json({ err });
      return next();
    }
  });
}
