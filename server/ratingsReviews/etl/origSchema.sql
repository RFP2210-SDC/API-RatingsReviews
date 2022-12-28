DROP TABLE IF EXISTS orig_reviews;
DROP TABLE IF EXISTS orig_reviews_photos;
DROP TABLE IF EXISTS orig_characteristics;
DROP TABLE IF EXISTS orig_characteristic_reviews;

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

DROP INDEX IF EXISTS idx_reviews_reported;
CREATE INDEX idx_reviews_reported ON orig_reviews(reported);

COPY orig_reviews FROM '/Users/chadfusco/Library/CloudStorage/GoogleDrive-mustrunfaster@gmail.com/Other computers/My Laptop/Current Folder/Coding Career/Coding Education/Hack Reactor SEI/API-RatingsReviews/rawdata/transformed_reviews.csv' WITH (FORMAT CSV, HEADER true);

COPY orig_reviews_photos FROM '/Users/chadfusco/Library/CloudStorage/GoogleDrive-mustrunfaster@gmail.com/Other computers/My Laptop/Current Folder/Coding Career/Coding Education/Hack Reactor SEI/API-RatingsReviews/rawdata/reviews_photos.csv' WITH (FORMAT CSV, HEADER true);

COPY orig_characteristics FROM '/Users/chadfusco/Library/CloudStorage/GoogleDrive-mustrunfaster@gmail.com/Other computers/My Laptop/Current Folder/Coding Career/Coding Education/Hack Reactor SEI/API-RatingsReviews/rawdata/characteristics.csv' WITH (FORMAT CSV, HEADER true);

COPY orig_characteristic_reviews FROM '/Users/chadfusco/Library/CloudStorage/GoogleDrive-mustrunfaster@gmail.com/Other computers/My Laptop/Current Folder/Coding Career/Coding Education/Hack Reactor SEI/API-RatingsReviews/rawdata/characteristic_reviews.csv' WITH (FORMAT CSV, HEADER true);


/*  Execute this file from the command line by typing:
 *    psql reviews < server/ratingsReviews/etl/origSchema.sql
 *  to create the tables in the reviews database.*/

-- To login to postgres reviews database on CL enter:
-- psql reviews