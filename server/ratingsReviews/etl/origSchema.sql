DROP TABLE IF EXISTS orig_characteristic_reviews;
DROP TABLE IF EXISTS orig_reviews_photos;
DROP TABLE IF EXISTS orig_characteristics;
DROP TABLE IF EXISTS orig_reviews;
DROP TABLE IF EXISTS characteristic_reviews;
DROP TABLE IF EXISTS reviews_photos;
DROP TABLE IF EXISTS characteristics;
DROP TABLE IF EXISTS reviews;

CREATE TABLE orig_reviews (
  review_id INT PRIMARY KEY,
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

CREATE TABLE reviews (
  review_id SERIAL PRIMARY KEY,
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
  id SERIAL PRIMARY KEY,
  review_id INT,
  url TEXT
);

CREATE TABLE characteristics (
  id SERIAL PRIMARY KEY,
  product_id INT,
  name TEXT
);

CREATE TABLE characteristic_reviews (
  id SERIAL PRIMARY KEY,
  characteristic_id INT,
  review_id INT,
  value INT
);

COPY orig_reviews FROM '/Users/chadfusco/Library/CloudStorage/GoogleDrive-mustrunfaster@gmail.com/Other computers/My Laptop/Current Folder/Coding Career/Coding Education/Hack Reactor SEI/API-RatingsReviews/rawdata/transformed_reviews.csv' WITH (FORMAT CSV, HEADER true);

COPY orig_reviews_photos FROM '/Users/chadfusco/Library/CloudStorage/GoogleDrive-mustrunfaster@gmail.com/Other computers/My Laptop/Current Folder/Coding Career/Coding Education/Hack Reactor SEI/API-RatingsReviews/rawdata/reviews_photos.csv' WITH (FORMAT CSV, HEADER true);

COPY orig_characteristics FROM '/Users/chadfusco/Library/CloudStorage/GoogleDrive-mustrunfaster@gmail.com/Other computers/My Laptop/Current Folder/Coding Career/Coding Education/Hack Reactor SEI/API-RatingsReviews/rawdata/characteristics.csv' WITH (FORMAT CSV, HEADER true);

COPY orig_characteristic_reviews FROM '/Users/chadfusco/Library/CloudStorage/GoogleDrive-mustrunfaster@gmail.com/Other computers/My Laptop/Current Folder/Coding Career/Coding Education/Hack Reactor SEI/API-RatingsReviews/rawdata/characteristic_reviews.csv' WITH (FORMAT CSV, HEADER true);

-- copying into new tables in order to utilize SERIAL for IDs:

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


/*  Execute this file from the command line by typing:
 *    psql reviews < server/ratingsReviews/etl/origSchema.sql
 *  to create the tables in the reviews database.*/

-- To login to postgres reviews database on CL enter:
-- psql reviews