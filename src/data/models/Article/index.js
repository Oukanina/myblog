import Article from './Article';
import ArticleTag from './ArticleTag';

Article.hasMany(ArticleTag, {
  foreignKey: 'articleId',
  as: 'child',
  onUpdate: 'cascade',
  onDelete: 'cascade',
});

export { Article, ArticleTag };
