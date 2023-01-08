// REQUIRE STATEMENTS
const debug = require('debug')('http');
require('dotenv').config();
const express = require('express');
// const morgan = require('morgan');
const cors = require('cors');
// const compression = require('compression');
const db = require('./db');

const app = express();

// APP-WIDE MIDDLEWARE
app.use((req, res, next) => {
  debug('Request rcvd, Morgan starting...');
  next();
});
// app.use(morgan('dev'));
app.use((req, res, next) => {
  debug('Morgan complete. Remaining middleware starting...');
  next();
});
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
  debug('Middleware complete. Starting database conn...');
  db.getConnection((error, client, release) => {
    if (error) {
      res.status(400).send(error);
    } else {
      debug('Database connection established');
      db.getReviews(req.query, client, release, (err, reviews) => {
        if (err) {
          res.status(400).send(err);
        } else {
          debug('Reviews processed');
          res.status(200).send(reviews);
          debug('Reviews sent');
        }
      });
    }
  });
});

app.get('/reviews/meta', (req, res) => {
  debug('Middleware complete. Starting database conn...');
  db.getConnection((error, client, release) => {
    if (error) {
      res.status(400).send(error);
    } else {
      debug('Database connection established');
      db.getMetadata(req.query.product_id, client, release, (err, metadata) => {
        if (err) {
          res.status(400).send(err);
        } else {
          debug('Metadata processed');
          res.status(200).send(metadata);
          debug('Metadata sent');
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
