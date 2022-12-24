/* eslint-disable camelcase */
/* eslint-disable consistent-return */
const { Pool } = require('pg');

const pool = new Pool();

exports.getReviews = (params, callback) => {
  pool.connect((err, client, release) => {
    if (err) {
      callback(err.stack);
    }
    // Connection made - begin query
    const {
      product_id, sort, page, count,
    } = params;
    const offset = (page - 1) * count;
    const sortOrder = sort === 'newest' ? 'date' : 'helpfulness';
    console.log('sortOrder:', sortOrder)
    client.query(
      `SELECT * FROM orig_reviews
        WHERE product_id=$1::integer
        ORDER BY $2::text
        LIMIT $3::integer OFFSET $4::integer;`,
      [product_id, sortOrder, count, offset],
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
