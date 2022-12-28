/* eslint-disable camelcase */
/* eslint-disable consistent-return */
const { Pool } = require('pg');
const format = require('pg-format');

const pool = new Pool();

exports.getConnection = (cb) => {
  pool.connect((err, client, release) => {
    if (err) {
      cb(err.stack);
    } else {
      cb(null, client, release);
    }
  });
};

// PUT HELPFULNESS ---------------------------
exports.updateHelpfulness = (review_id, client, release, callback) => {
  // Build query string
  const query = format(
    'UPDATE orig_reviews '
    + 'SET helpfulness = helpfulness + 1 '
    + 'WHERE review_id=%s;',
    review_id,
  );

  // Perform query
  client.query(query)
    .then(() => {
      callback(null);
    })
    .catch((err) => callback(err.stack))
    .finally(release());
};

// GET REVIEWS ---------------------------
exports.getReviews = (params, client, release, callback) => {
  // Build query string
  const {
    product_id, sort, page, count,
  } = params;
  const offset = (page - 1) * count;

  let sortOrder;
  if (sort === 'newest') {
    sortOrder = 'date DESC, r.review_id';
  } else if (sort === 'helpfulness') {
    sortOrder = 'helpfulness DESC, date DESC, r.review_id';
  } else {
    // relevant calc'ed by helpfulness minus months ago.
    sortOrder = 'helpfulness-(extract(epoch from now())::INTEGER'
      + ' - extract(epoch from date)::INTEGER)/2600000 DESC, r.review_id';
  }

  const query = format(
    'SELECT r.review_id, rating, summary, recommend, response, body, date, reviewer_name, '
    + 'helpfulness, JSONB_AGG(JSONB_BUILD_OBJECT(\'id\', id, \'url\', url) ORDER BY id) AS photos '
    + 'FROM orig_reviews AS r '
    + 'LEFT JOIN orig_reviews_photos AS p ON r.review_id=p.review_id '
    + 'WHERE product_id=%s AND reported=false '
    + 'GROUP BY r.review_id '
    + 'ORDER BY %s LIMIT %s OFFSET %s;',
    product_id,
    sortOrder,
    count,
    offset,
  );

  // Perform query
  client.query(query)
    .then((res) => {
      const results = res.rows.map((review) => (
        review.photos.length === 1 && !review.photos[0].url ? { ...review, photos: [] } : review
      ));
      const result = {
        product: product_id,
        page: parseInt(page, 10),
        count: parseInt(count, 10),
        results,
      };
      callback(null, result);
    })
    .catch((err) => callback(err.stack))
    .finally(release());
};

// GET METADATA ---------------------------
exports.getMetadata = (product_id, client, release, callback) => {
  // Build query strings
  const characterQuery = format(
    'SELECT s.product_id::text, JSONB_OBJECT_AGG(name, characteristics) AS characteristics '
    + 'FROM ('
      + 'SELECT c.product_id, c.name, '
      + 'JSONB_BUILD_OBJECT(\'id\', c.id, \'value\', ROUND(AVG(cr.value),4)) AS characteristics '
      + 'FROM orig_characteristic_reviews AS cr '
      + 'JOIN orig_characteristics AS c ON c.id=cr.characteristic_id '
      + 'WHERE c.product_id=%s '
      + 'GROUP BY c.id, c.name'
    + ') AS s '
    + 'GROUP BY s.product_id;',
    product_id,
  );

  const ratingsQuery = format(
    'SELECT JSONB_OBJECT_AGG(rating, ratings::text) AS ratings '
    + 'FROM ('
      + 'SELECT product_id, rating, COUNT(rating) AS ratings '
      + 'FROM orig_reviews AS r '
      + 'WHERE product_id=%s '
      + 'GROUP BY rating, product_id'
    + ') AS s '
    + 'GROUP BY s.product_id;',
    product_id,
  );

  const recommendQuery = format(
    'SELECT JSONB_OBJECT_AGG(recommend, recommendCnt::text) AS recommended '
    + 'FROM ('
      + 'SELECT product_id, recommend, COUNT(recommend) AS recommendCnt '
      + 'FROM orig_reviews AS r '
      + 'WHERE product_id=%s '
      + 'GROUP BY product_id, recommend '
    + ') AS s '
    + 'GROUP BY s.product_id;',
    product_id,
  );

  // Perform queries
  const results = {};
  client.query(characterQuery)
    .then((res) => {
      Object.assign(results, res.rows[0]);
      return client.query(ratingsQuery);
    })
    .then((res) => {
      Object.assign(results, res.rows[0]);
      return client.query(recommendQuery);
    })
    .then((res) => {
      Object.assign(results, res.rows[0]);
      callback(null, results);
    })
    .catch((err) => callback(err.stack))
    .finally(release());
};
