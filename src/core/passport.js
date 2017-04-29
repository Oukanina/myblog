/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

/**
 * Passport.js reference implementation.
 * The database schema used in this sample is available at
 * https://github.com/membership/membership.db/tree/master/postgres
 */

import passport from 'passport';
import { verify } from 'jsonwebtoken';
import { Strategy as BearerStrategy } from 'passport-http-bearer';
import { auth as config, host, machineName } from '../config.js';
import { getUserByToken } from '../data/utils/userUtils.js';
// import { Strategy as FacebookStrategy } from 'passport-facebook';
// import { User, UserLogin, UserProfile } from '../data/models';

// export function getUsersByToken(token) {
//   const name = 'local:token';
//   return User.findAll({
//     attributes: ['id', 'email', 'profile.displayName'],
//     where: {
//       '$logins.name$': name,
//       '$logins.key$': token,
//       onDelete: false,
//     },
//     include: [{
//       attributes: ['name', 'key'],
//       model: UserLogin,
//       as: 'logins',
//       required: true,
//     }, {
//       attributes: ['displayName'],
//       model: UserProfile,
//       as: 'profile',
//     }],
//   });
// }

passport.use(new BearerStrategy({
  passReqToCallback: true,
}, async (req, token, done) => {
  try {
    verify(token, config.jwt.secret);
    const users = await getUserByToken(token);
    if (!users.length) return done(null, false);

    const LoginIp = req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress;
    const activity = await users[0].getActivity({
      where: { last: true },
    });

    let lastLoginIp;
    let lastLoginTime;

    if (activity.length) {
      lastLoginIp = activity[0].get('lastLoginIp');
      lastLoginTime = activity[0].get('lastLoginTime');
      await activity[0].update({
        last: false,
      });
    } else {
      lastLoginIp = '233';
      lastLoginTime = '233';
    }

    await users[0].createActivity({
      lastLoginIp: LoginIp,
      lastLoginTime: new Date(),
    });

    const { email } = users[0].dataValues;

    return done(null, {
      email,
      lastLoginIp,
      lastLoginTime,
      HOME: `/home/${email}`,
      hostname: machineName || host,
      username: email.split('@')[0],
    }, { scope: 'read' });
  } catch (err) {
    if (err.name === 'JsonWebTokenError') return done(null, false);
    if (err.name === 'TokenExpiredError') return done(null, false);
    console.log(err); // eslint-disable-line no-console
    return done(null, err);
  }
},

));

export default passport;
