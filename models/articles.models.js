const db = require("../db/connection");

exports.retrieveArticleById = (articleId) => {
  const queryString = `SELECT * FROM articles WHERE article_id = $1;`;

  const queryValue = [articleId];

  return db.query(queryString, queryValue).then(({ rows }) => {
    if (rows.length === 0) {
      return Promise.reject({
        status: 404,
        msg: "404: Not found",
      });
    }
    return rows[0];
  });
};

exports.findArticles = (sort_by = "created_at", order = "desc", topic) => {
  let queryString = `SELECT articles.author, articles.title, articles.article_id, articles.topic, articles.created_at, articles.votes, articles.article_img_url, COUNT(*) AS comment_count 
  FROM articles LEFT JOIN comments ON comments.article_id = articles.article_id`;

  const validSortBy = [
    "author",
    "article_id",
    "title",
    "topic",
    "created_at",
    "votes",
    "article_img_url",
    "comment_count",
  ];

  const validOrder = ["asc", "desc"];
  const queryValues = [];

  if (topic) {
    queryValues.push(topic);
    queryString += ` WHERE topic = $1`;
  }

  if (!validSortBy.includes(sort_by) || !validOrder.includes(order)) {
    return Promise.reject({ status: 400, msg: "400: Bad request" });
  }

  if (sort_by && order) {
    queryString += ` GROUP BY articles.article_id ORDER BY ${sort_by} ${order}`;
  }

  return db.query(queryString, queryValues).then(({ rows }) => {
    return rows;
  });
};

exports.patchVoteByArticleId = (inc_votes, article_id) => {
  const queryString = `UPDATE articles
  SET
    votes = votes + $1
  WHERE article_id = $2
  RETURNING *;
  `;

  const queryValues = [inc_votes, article_id];

  return db.query(queryString, queryValues).then(({ rows }) => {
    if (rows.length === 0) {
      return Promise.reject({
        status: 404,
        msg: "404: Not found",
      });
    }
    return rows[0];
  });
};
