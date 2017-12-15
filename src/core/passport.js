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

const anonymous = {
  id: '233',
  email: '',
  HOME: '/home/anonymous',
  home: '/home/anonymous',
  path: '/home/anonymous',
  hostname: machineName || host,
  username: 'anonymous',
  lastLoginIp: '',
  lastLoginTime: new Date(),
};

passport.use(new BearerStrategy({
  passReqToCallback: true,
}, async (req, token, done) => {
  try {
    verify(token, config.jwt.secret);
    const users = await getUserByToken(token);

    if (!users.length) {
      return done(null, anonymous, { scope: 'read' });
    }
    const user = users[0];

    const LoginIp = req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress;
    const activities = await user.getActivity({
      where: { last: true },
    });

    let lastLoginIp;
    let lastLoginTime;

    if (activities.length) {
      lastLoginIp = activities[0].get('lastLoginIp');
      lastLoginTime = activities[0].get('lastLoginTime');
      await activities[0].update({
        last: false,
      });
    } else {
      lastLoginIp = '';
      lastLoginTime = new Date();
    }

    await user.createActivity({
      lastLoginIp: LoginIp,
      lastLoginTime: new Date(),
    });

    return done(null, {
      id: user.id,
      email: user.email,
      HOME: user.homePath,
      home: user.homePath,
      path: user.homePath,
      hostname: machineName || host,
      username: user.username,
      lastLoginIp,
      lastLoginTime,
    }, { scope: 'read' });
  } catch (err) {
    console.log(err.name); // eslint-disable-line no-console
    if (err.name === 'JsonWebTokenError') return done(null, false);
    if (err.name === 'TokenExpiredError') return done(null, false);
    return done(err);
  }
},

));

export default passport;
