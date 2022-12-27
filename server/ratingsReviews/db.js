/* eslint-disable camelcase */
/* eslint-disable consistent-return */
const { Pool } = require('pg');
const format = require('pg-format');

const pool = new Pool();

exports.getReviews = (params, callback) => {
  pool.connect((err, client, release) => {
    if (err) {
      callback(err.stack);
    }

    // Connection made - build query string
    const {
      product_id, sort, page, count,
    } = params;
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
      'SELECT * FROM orig_reviews WHERE product_id=%s AND reported=false '
      + 'ORDER BY %s LIMIT %s OFFSET %s;',
      product_id,
      sortOrder,
      count,
      offset,
    );

    // Perform query
    console.log(query);
    client.query(
      query,
      (error, result) => {
        release();
        if (error) {
          callback(error.stack);
        } else {
          callback(null, result.rows);
        }
      },
    );
  });
};
