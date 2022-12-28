/* eslint-disable consistent-return */
// REQUIRE STATEMENTS
require('dotenv').config();
const express = require('express');
// const path = require('path');
const morgan = require('morgan');
const cors = require('cors');
// const compression = require('compression');
const db = require('./db');

const app = express();

// APP-WIDE MIDDLEWARE
app.use(morgan('dev'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(compression());

// ROUTES
app.get('/reviews', (req, res) => {
  db.getConnection((error, client, release) => {
    if (error) {
      res.status(400).send(error);
    } else {
      db.getReviews(req.query, client, release, (err, reviews) => {
        if (err) {
          res.status(400).send(err);
        } else {
          res.status(200).send(reviews);
        }
      });
    }
  });
});

// PORT AND SERVER LISTEN
const PORT = process.env.PORT || 3000;
app.listen(PORT);
console.log(`Server listening at http://localhost:${PORT}`);
