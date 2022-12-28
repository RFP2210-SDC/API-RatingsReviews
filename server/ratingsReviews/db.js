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

  // Perform initial query
  console.log(query);
  client.query(query)
    .then((res) => {
      const results = res.rows;
      console.log(res.rows);
      if (res.rows.photos.length === 1 && res.rows.photos.url === null) {
        results.photos = [];
      }
      const result = {
        product: product_id,
        page: parseInt(page, 10),
        count: parseInt(count, 10),
        results,
      };
      callback(null, result);
    })
    .catch((err) => callback(err.stack));
};

// PRIOR ITERATIONS:

// const query = format(
//   'SELECT r.review_id, rating, summary, recommend, response, body, date, '
//   + 'reviewer_name, helpfulness, ARRAY_AGG(p.id || p.url) photos '
//   + 'FROM orig_reviews AS r '
//   + 'LEFT JOIN orig_reviews_photos AS p ON r.review_id=p.review_id '
//   + 'WHERE product_id=%s AND reported=false '
//   + 'GROUP BY r.review_id '
//   + 'ORDER BY %s LIMIT %s OFFSET %s;',
//   product_id,
//   sortOrder,
//   count,
//   offset,
// );
// RESULT:
// [
//   {
//       "review_id": 5,
//       "rating": 3,
//       "summary": "I'm enjoying wearing these shades",
//       "recommend": true,
//       "response": "null",
//       "body": "Comfortable and practical.",
//       "date": "2021-03-17T13:28:37.620Z",
//       "reviewer_name": "shortandsweeet",
//       "helpfulness": 5,
//       "photos": [
//           "2https://images.unsplash.com/photo-1561693532-9ff59442a7db?ixlib=rb-1.2.1&auto=format&fit=crop&w=975&q=80",
//           "3https://images.unsplash.com/photo-1487349384428-12b47aca925e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1650&q=80",
//           "1https://images.unsplash.com/photo-1560570803-7474c0f9af99?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=975&q=80"
//       ]
//   },