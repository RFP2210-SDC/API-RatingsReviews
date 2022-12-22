const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/reviewsDB')
  .catch((err) => console.log(err));

const db = {};

const users = new mongoose.Schema({
  reviewer_name: String,
  reviewer_email: String,
});

db.User = mongoose.model('User', users);

const metadata = new mongoose.Schema({
  product_id: Number,
  ratings: Object,
  recommended: Object,
  characteristics: Object,
});

db.Metadata = mongoose.model('Metadata', metadata);

const reviews = new mongoose.Schema({
  review_id: Number,
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  rating: Number,
  summary: String,
  recommend: Boolean,
  response: String,
  body: String,
  date: Date,
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  helpfulness: Number,
  photos: Object,
  reported: Boolean,
});

db.Review = mongoose.model('Review', reviews);

module.exports = db;
