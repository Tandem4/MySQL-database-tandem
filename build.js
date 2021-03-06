var bookshelf = require('./config.js');

/************************************************************/
// Schema definitions
/************************************************************/

// 'increments' creates an auto incrementing column, by default used as primary key
module.exports = function(callback) {

// drop all preexisting data
bookshelf.knex.schema
  .dropTableIfExists('processed_articles_trends')
  .dropTableIfExists('processed_articles')
  .dropTableIfExists('publications')
  .dropTableIfExists('trends')
  .dropTableIfExists('users')
  .then( function() {
    console.log('UNSEED: previous data dropped');

    // rebuild schema
    bookshelf.knex.schema.createTable('users', function(user) {
      user.increments('id').primary();
      user.string('email_address', 100).unique();
      user.string('link_uuid', 255);
      user.string('api_key', 255);
      user.string('api_secret', 255);
      user.boolean('verified');
      user.timestamp('created_at').defaultTo(bookshelf.knex.fn.now());  // to be used as salt

    }).then( function() {
      bookshelf.knex.schema.createTable('trends', function(trend) {
        trend.increments('id').primary();
        trend.float('rank');
        trend.string('trend_name', 255);
        trend.timestamps();

      }).then( function() {
        bookshelf.knex.schema.createTable('publications', function(publication) {
          publication.increments('id').primary();
          publication.string('pub_name', 100);
          publication.string('pub_url', 255);

        }).then( function() {

          bookshelf.knex.schema.createTable('processed_articles', function(article) {
            article.increments('id').primary();
            article.string('title', 255);
            article.integer('frequency_viewed');
            article.string('article_date');

            // defaults to textType 'text'; 'mediumtext' and 'longtext' also available
            article.text('article_summary');
            article.text('article_url');
            article.text('image_url');

            // ibm watson api results
            article.integer('anger');
            article.integer('disgust');
            article.integer('fear');
            article.integer('joy');
            article.integer('sadness');
            article.integer('score');
            article.string('type');
            article.timestamps();

            // foreign keys
            article.integer('pub_id').unsigned().references('publications.id');

          }).then( function() {
            bookshelf.knex.schema.createTable('processed_articles_trends', function(join) {

              // foreign keys
              join.integer('trend_id').unsigned().references('trends.id');
              join.integer('processed_article_id').unsigned().references('processed_articles.id');

            }).then( function(res) {
              console.log('BUILD: Successfully built schema');
              callback();
            }).catch( function(err) {
              console.log('BUILD: An error occurred', err);
            });
          });
        });
      });
    });
  });
};
