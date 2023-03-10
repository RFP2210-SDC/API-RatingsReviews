DROP TABLE IF EXISTS characteristic_reviews CASCADE;
DROP TABLE IF EXISTS reviews_photos CASCADE;
DROP TABLE IF EXISTS characteristics CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;

DROP INDEX IF EXISTS idx_reviews_product_id;
DROP INDEX IF EXISTS idx_reviews_photos_review_id;
DROP INDEX IF EXISTS idx_char_reviews_char_id;
DROP INDEX IF EXISTS idx_chars_product_id;

CREATE TABLE reviews (
  review_id INT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  product_id INT,
  rating INT,
  date TIMESTAMPTZ,
  summary TEXT,
  body TEXT,
  recommend BOOLEAN,
  reported BOOLEAN DEFAULT false,
  reviewer_name TEXT,
  reviewer_email TEXT,
  response TEXT DEFAULT null,
  helpfulness INT DEFAULT 0
);

CREATE TABLE reviews_photos (
  id INT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  review_id INT,
  url TEXT
);

CREATE TABLE characteristics (
  id INT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  product_id INT,
  name TEXT
);

CREATE TABLE characteristic_reviews (
  id INT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  characteristic_id INT,
  review_id INT,
  value INT
);

CREATE INDEX idx_reviews_product_id ON reviews(product_id);
CREATE INDEX idx_reviews_photos_review_id ON reviews_photos(review_id);
CREATE INDEX idx_char_reviews_char_id ON characteristic_reviews(characteristic_id);
CREATE INDEX idx_chars_product_id ON characteristics(product_id);

INSERT INTO reviews (product_id, rating, date, summary, body, recommend, reported, reviewer_name, reviewer_email, response, helpfulness)
SELECT product_id, rating, date, summary, body, recommend, reported, reviewer_name, reviewer_email, response, helpfulness
FROM orig_reviews;

INSERT INTO reviews_photos (review_id, url)
SELECT review_id, url
FROM orig_reviews_photos;

INSERT INTO characteristics (product_id, name)
SELECT product_id, name
FROM orig_characteristics;

INSERT INTO characteristic_reviews (characteristic_id, review_id, value)
SELECT characteristic_id, review_id, value
FROM orig_characteristic_reviews;

\i server/ratingsReviews/etl/denormalize.sql


/*  Execute this file from the command line by typing:
 *    psql reviews < server/ratingsReviews/etl/regenTbls.sql
 *  to create the tables in the reviews database.*/

-- To login to postgres reviews database on CL enter:
-- psql reviews