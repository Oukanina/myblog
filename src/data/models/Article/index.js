import Article from './Article';
import ArticleTag from './ArticleTag';
import File from '../File/File.js';

Article.hasMany(ArticleTag, {
  foreignKey: 'articleId',
  as: 'child',
  onUpdate: 'cascade',
  onDelete: 'cascade',
});

Article.belongsTo(File, {
  foreignKey: 'fileId',
  as: 'article',
  onUpdate: 'cascade',
  onDelete: 'cascade',
});

export { Article, ArticleTag };
