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
      sortOrder = 'date DESC, id';
    } else if (sort === 'helpfulness') {
      sortOrder = 'helpfulness DESC, date DESC, id';
    } else {
      // relevant calc'ed by helpfulness minus months ago.
      sortOrder = 'helpfulness-(extract(epoch from now())::INTEGER'
        + ' - extract(epoch from date)::INTEGER)/2600000 DESC, id';
    }
    const query = format(
      'SELECT * FROM orig_reviews WHERE product_id=%s '
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

// pool.connect((err, client, release) => {
//   if (err) {
//     return console.error('Error acquiring client', err.stack);
//   }
//   client.query('SELECT NOW()', (error, result) => {
//     release();
//     if (error) {
//       return console.error('Error executing query', error.stack);
//     }
//     console.log(result.rows);
//   });
// });

// async function setupDatabase() {
//   client.query('CREATE DATABASE IF NOT EXISTS reviews')
//     .then(client.query(`CREATE TABLE IF NOT EXISTS metadata (
//       id INT NOT NULL PRIMARY KEY,
//       ratings
//     )`));
// }

// // FROM MOVIE LIST
// const mysql = require('mysql2');

// const db = mysql.createConnection({
//   host: 'localhost',
//   user: 'root',
//   password: '',
//   database: process.env.DB_NAME
// })

// module.exports = db;

// SELECT * FROM orig_reviews ORDER BY helpfulness-(extract(epoch from now())::INTEGER - extract(epoch from date)::INTEGER)/2600000 DESC LIMIT 10;