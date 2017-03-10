/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import sequelize from '../sequelize';
import { User, UserLogin, UserClaim, UserProfile } from './User';
import { Article, ArticleTag } from './Article';
import { File, FILETYPE, LINKTO, ROOTID } from './File';
import { Group } from './Group';

function sync(...args) {
  return sequelize.sync(...args);
}

export default { sync };
export { User, UserLogin, UserClaim, UserProfile };
export { Article, ArticleTag };
export { File, FILETYPE, LINKTO, ROOTID };
export { Group };
