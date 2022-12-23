DROP TABLE IF EXISTS orig_reviews;
DROP TABLE IF EXISTS orig_reviews_photos;
DROP TABLE IF EXISTS orig_characteristics;
DROP TABLE IF EXISTS orig_characteristic_reviews;

CREATE TABLE orig_reviews (
  id INT PRIMARY KEY,
  product_id INT,
  rating INT,
  date TIMESTAMPTZ,
  summary TEXT,
  body TEXT,
  recommend BOOLEAN,
  reported BOOLEAN,
  reviewer_name TEXT,
  reviewer_email TEXT,
  response TEXT,
  helpfulness INT
);

CREATE TABLE orig_reviews_photos (
  id INT PRIMARY KEY,
  review_id INT,
  url TEXT
);

CREATE TABLE orig_characteristics (
  id INT PRIMARY KEY,
  product_id INT,
  name TEXT
);

CREATE TABLE orig_characteristic_reviews (
  id INT PRIMARY KEY,
  characteristic_id INT,
  review_id INT,
  value INT
);


/*  Execute this file from the command line by typing:
 *    psql reviews < server/ratingsReviews/loadInSchema.sql
 *  to create the tables in the reviews database.*/

-- To login to postgres reviews database on CL enter:
-- psql reviews