DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS metadata;

CREATE TABLE users (
  reviewer_name TEXT PRIMARY KEY,
  reviewer_email TEXT
);

CREATE TABLE metadata (
  product_id INT PRIMARY KEY,
  ratings JSONB,
  recommended JSONB,
  characteristics JSONB
);

CREATE TABLE reviews (
  review_id INT PRIMARY KEY,
  product_id INT,
  rating INT,
  summary TEXT,
  recommend BOOLEAN,
  response TEXT,
  body TEXT,
  date TIMESTAMPTZ,
  reviewer_name TEXT,
  helpfulness INT,
  photos JSONB,
  reported BOOLEAN,
  FOREIGN KEY (product_id) REFERENCES metadata(product_id),
  FOREIGN KEY (reviewer_name) REFERENCES users(reviewer_name)
);

CREATE INDEX idx_reviews_reported ON reviews(reported);

/*  Execute this file from the command line by typing:
 *    psql reviews < server/ratingsReviews/etl/schema.sql
 *  to create the tables in the reviews database.*/

-- To login to postgres reviews database on CL enter:
-- psql reviews
-- then type \dt to view all tables