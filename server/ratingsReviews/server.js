// REQUIRE STATEMENTS
const newrelic = require('newrelic');
require('dotenv').config();
const express = require('express');
// const path = require('path');
const morgan = require('morgan');
const cors = require('cors');
// const compression = require('compression');
const db = require('./db');

const app = express();

// APP-WIDE MIDDLEWARE
app.us6e(morgan('dev'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(compression());

// ROUTES
app.get(`/${process.env.LOADERIO_KEY}`, (req, res) => (
  res.send(process.env.LOADERIO_KEY)
));

app.put('/reviews/:review_id/helpful', (req, res) => {
  db.getConnection((error, client, release) => {
    if (error) {
      res.status(400).send(error);
    } else {
      db.update(req.params.review_id, 'helpfulness', client, release, (err) => {
        if (err) {
          res.status(400).send(err);
        } else {
          res.sendStatus(204);
        }
      });
    }
  });
});

app.put('/reviews/:review_id/report', (req, res) => {
  db.getConnection((error, client, release) => {
    if (error) {
      res.status(400).send(error);
    } else {
      db.update(req.params.review_id, 'reported', client, release, (err) => {
        if (err) {
          res.status(400).send(err);
        } else {
          res.sendStatus(204);
        }
      });
    }
  });
});

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

app.get('/reviews/meta', (req, res) => {
  db.getConnection((error, client, release) => {
    if (error) {
      res.status(400).send(error);
    } else {
      db.getMetadata(req.query.product_id, client, release, (err, metadata) => {
        if (err) {
          res.status(400).send(err);
        } else {
          res.status(200).send(metadata);
        }
      });
    }
  });
});

app.post('/reviews', (req, res) => {
  const emailPattern = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}/;
  if (emailPattern.test(req.body.email)) {
    res.status(400).send('invalid email address');
  } else {
    db.getConnection((error, client, release) => {
      if (error) {
        res.status(400).send(error);
      } else {
        db.postReview(req.body, client, release, (err) => {
          if (err) {
            res.status(400).send(err);
          } else {
            res.sendStatus(201);
          }
        });
      }
    });
  }
});

module.exports = app;
