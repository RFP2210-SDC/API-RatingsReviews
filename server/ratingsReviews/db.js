/* eslint-disable camelcase */
/* eslint-disable consistent-return */
const debug = require('debug')('query');
const { Client, Pool } = require('pg');
const format = require('pg-format');

const [reviewsTbl, reviewPhotosTbl, charsTbl, charReviewsTbl] = process.env.NODE_ENV === 'test'
  ? ['test_reviews', 'test_reviews_photos', 'test_characteristics', 'test_characteristic_reviews']
  : ['reviewsV2', 'reviews_photos', 'characteristics', 'characteristic_reviews'];

// const testClient = new Client();
const testClient = new Client({ database: 'reviews' });

if (process.env.NODE_ENV === 'test') {
  testClient.connect();
}

exports.db = testClient;

const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
  idleTimeoutMillis: 30000,
});

exports.getConnection = (cb) => {
  pool.connect((err, client, release) => {
    if (err) {
      cb(err.stack);
    } else {
      cb(null, client, release);
    }
  });
};

// PUT HELPFULNESS & REPORTED ---------------------------
exports.update = (review_id, reportHelp, client, release, callback) => {
  // Build query string
  const setClause = reportHelp[0] === 'h' ? `${reportHelp} = ${reportHelp} + 1 `
    : `${reportHelp} = true `;
  const query = format(
    'UPDATE %s '
    + 'SET %s '
    + 'WHERE review_id=%s;',
    reviewsTbl,
    setClause,
    review_id,
  );

  // Perform query
  client.query(query)
    .then(() => {
      callback(null);
    })
    .catch((err) => callback(err.stack))
    .finally(() => (release()));
};

// GET REVIEWS ---------------------------
exports.getReviews = (params, client, release, callback) => {
  // Build query string
  const { product_id, sort } = params;
  const page = params.page || 1;
  const count = params.count || 5;
  const offset = (page - 1) * count;

  let sortOrder;
  if (sort === 'newest') {
    sortOrder = 'date DESC, review_id';
  } else if (sort === 'helpfulness') {
    sortOrder = 'helpfulness DESC, date DESC, review_id';
  } else {
    // relevant calc'ed by helpfulness minus months ago.
    sortOrder = 'helpfulness-(extract(epoch from now())::INTEGER'
      + ' - extract(epoch from date)::INTEGER)/2600000 DESC, review_id';
  }

  const query = format(
    'SELECT review_id, rating, summary, recommend, response, body, date, reviewer_name, '
    + 'helpfulness, photos '
    + 'FROM %s '
    + 'WHERE product_id=%s AND reported=false '
    + 'GROUP BY review_id '
    + 'ORDER BY %s LIMIT %s OFFSET %s;',
    reviewsTbl,
    product_id,
    sortOrder,
    count,
    offset,
  );

  debug('Query string processed. Handing off to Postgres...');

  // Perform query
  client.query(query)
    .then((res) => {
      debug('Results rcvd from Postgres. Processing in Node...');
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
    .finally(() => (release()));
};

// GET METADATA ---------------------------
exports.getMetadata = (product_id, client, release, callback) => {
  // Build query strings
  const characterQuery = format(
    'SELECT s.product_id::text, JSONB_OBJECT_AGG(name, characteristics) AS characteristics '
    + 'FROM ('
      + 'SELECT c.product_id, c.name, '
      + 'JSONB_BUILD_OBJECT(\'id\', c.id, \'value\', ROUND(AVG(cr.value),4)) AS characteristics '
      + 'FROM %s AS cr '
      + 'JOIN %s AS c ON c.id=cr.characteristic_id '
      + 'WHERE c.product_id=%s '
      + 'GROUP BY c.id, c.name'
    + ') AS s '
    + 'GROUP BY s.product_id;',
    charReviewsTbl,
    charsTbl,
    product_id,
  );

  const ratingsQuery = format(
    'SELECT JSONB_OBJECT_AGG(rating, ratings::text) AS ratings '
    + 'FROM ('
      + 'SELECT product_id, rating, COUNT(rating) AS ratings '
      + 'FROM %s AS r '
      + 'WHERE product_id=%s '
      + 'GROUP BY rating, product_id'
    + ') AS s '
    + 'GROUP BY s.product_id;',
    reviewsTbl,
    product_id,
  );

  const recommendQuery = format(
    'SELECT JSONB_OBJECT_AGG(recommend, recommendCnt::text) AS recommended '
    + 'FROM ('
      + 'SELECT product_id, recommend, COUNT(recommend) AS recommendCnt '
      + 'FROM %s AS r '
      + 'WHERE product_id=%s '
      + 'GROUP BY product_id, recommend '
    + ') AS s '
    + 'GROUP BY s.product_id;',
    reviewsTbl,
    product_id,
  );

  debug('Query strings processed. Handing off to Postgres...');

  // Perform queries
  const results = {};
  client.query(characterQuery)
    .then((res) => {
      debug('Postgres characteristics query results rcvd. Processing in node...');
      Object.assign(results, res.rows[0]);
      debug('Processing complete. Handing off to Postgres...');
      return client.query(ratingsQuery);
    })
    .then((res) => {
      debug('Postgres ratings query results rcvd. Processing in node...');
      Object.assign(results, res.rows[0]);
      debug('Processing complete. Handing off to Postgres...');
      return client.query(recommendQuery);
    })
    .then((res) => {
      debug('Postgres recommend query results rcvd. Processing in node...');
      Object.assign(results, res.rows[0]);
      callback(null, results);
    })
    .catch((err) => callback(err.stack))
    .finally(() => (release()));
};

// POST REVIEW ---------------------------
exports.postReview = (params, client, release, callback) => {
  // Build query strings
  const {
    product_id, rating, summary, body, recommend, name, email, photos, characteristics,
  } = params;

  const reviewQuery = format(
    'INSERT INTO reviews (product_id, rating, date, summary, body, recommend, '
      + 'reviewer_name, reviewer_email) '
      + 'VALUES (%s, %s, NOW(), %L, %L, %L, %L, %L) '
      + 'RETURNING review_id;', // returning review_id because we don't know what it is apriori.
    product_id,
    rating,
    summary,
    body,
    recommend,
    name,
    email,
  );

  function buildPhotosQuery(review_id) {
    const values = photos.map((url) => ([review_id, url]));
    return format(
      'INSERT INTO %s (review_id, url) '
        + 'VALUES %L '
        + 'RETURNING review_id;',
      reviewPhotosTbl,
      values,
    );
  }

  function buildReviewNormQuery(review_id) {
    return format(
      'INSERT INTO reviewsV2 (product_id, rating, date, summary, body, recommend, '
      + 'reported, reviewer_name, reviewer_email, response, helpfulness, photos) '
      + 'SELECT product_id, rating, date, summary, body, recommend, reported, reviewer_name, '
      + 'reviewer_email, response, helpfulness, JSONB_AGG(JSONB_BUILD_OBJECT("id", id, "url", url) '
      + 'ORDER BY id) AS photos '
      + 'FROM reviews AS r '
      + 'LEFT JOIN reviews_photos AS p ON r.review_id=p.review_id '
      + 'WHERE r.review_id=%s '
      + 'GROUP BY r.review_id;',
      review_id,
    );
  }

  function buildCharReviewsQuery(review_id) {
    const values = Object.entries(characteristics).map((entry) => {
      entry.push(review_id);
      return entry;
    });
    return format(
      'INSERT INTO %s (characteristic_id, value, review_id) '
        + 'VALUES %L '
        + 'RETURNING review_id;',
      charReviewsTbl,
      values,
    );
  }

  // Perform queries
  client.query(reviewQuery)
    .then((res) => (client.query(buildPhotosQuery(res.rows[0].review_id))))
    .then((res) => (client.query(buildCharReviewsQuery(res.rows[0].review_id))))
    .then((res) => (client.query(buildReviewNormQuery(res.rows[0].review_id))))
    .then(() => (callback(null)))
    .catch((err) => callback(err.stack))
    .finally(() => (release()));
};
