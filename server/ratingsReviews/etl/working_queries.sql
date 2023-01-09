-- WORKING ON GET ALL REVIEWS

SELECT r.review_id, rating, summary, recommend, response, body, date, reviewer_name,
  helpfulness, JSONB_AGG(JSONB_BUILD_OBJECT('id', id, 'url', url) ORDER BY id) AS photos
  FROM reviews AS r
  LEFT JOIN reviews_photos AS p ON r.review_id=p.review_id
  WHERE product_id=965029 AND reported=false
  GROUP BY r.review_id
  ORDER BY helpfulness-(extract(epoch from now())::INTEGER
    - extract(epoch from date)::INTEGER)/2600000 DESC, r.review_id
  LIMIT 5 OFFSET 0;

-- GET ALL REVIEW FOR V2:

SELECT review_id, rating, summary, recommend, response, body, date, reviewer_name,
  helpfulness, photos
  FROM reviewsV2
  WHERE product_id=965029 AND reported=false
  ORDER BY helpfulness-(extract(epoch from now())::INTEGER
    - extract(epoch from date)::INTEGER)/2600000 DESC, review_id
  LIMIT 5 OFFSET 0;


-- WORKING ON METADATA CHARACTERISTICS

SELECT c.product_id,
  JSONB_OBJECT_AGG(c.name, JSONB_BUILD_OBJECT('id', c.id, 'value', cr.value)) AS characteristics
  FROM reviews AS r
  JOIN characteristic_reviews AS cr ON r.review_id=cr.review_id
  JOIN characteristics AS c ON c.id=cr.characteristic_id
  WHERE c.product_id=1
  GROUP BY c.product_id;

-- 1 | {"Fit": {"id": 1, "value": 4}, "Length": {"id": 2, "value": 4}, "Comfort": {"id": 3, "value": 5}, "Quality": {"id": 4, "value": 4}}

SELECT r.review_id,
  JSONB_OBJECT_AGG(c.name, JSONB_BUILD_OBJECT('id', c.id, 'value', cr.value)) AS characteristics
  FROM reviews AS r
  JOIN characteristic_reviews AS cr ON r.review_id=cr.review_id
  JOIN characteristics AS c ON c.id=cr.characteristic_id
  WHERE c.product_id=1
  GROUP BY r.review_id;

-- 1 | {"Fit": {"id": 1, "value": 4}, "Length": {"id": 2, "value": 3}, "Comfort": {"id": 3, "value": 5}, "Quality": {"id": 4, "value": 4}}
-- 2 | {"Fit": {"id": 1, "value": 4}, "Length": {"id": 2, "value": 4}, "Comfort": {"id": 3, "value": 5}, "Quality": {"id": 4, "value": 4}}

SELECT c.name, JSONB_BUILD_OBJECT('id', c.id, 'value', AVG(cr.value)) AS characteristics
  FROM reviews AS r
  JOIN characteristic_reviews AS cr ON r.review_id=cr.review_id
  JOIN characteristics AS c ON c.id=cr.characteristic_id
  WHERE c.product_id=1
  GROUP BY c.id, c.name;

--  Fit     | {"id": 1, "value": 4.0000000000000000}
--  Length  | {"id": 2, "value": 3.5000000000000000}
--  Comfort | {"id": 3, "value": 5.0000000000000000}
--  Quality | {"id": 4, "value": 4.0000000000000000}

SELECT s.product_id, JSONB_OBJECT_AGG(name, characteristics) AS characteristics
  FROM (
    SELECT c.product_id, c.name,
      JSONB_BUILD_OBJECT('id', c.id, 'value', ROUND(AVG(cr.value),4)) AS characteristics
      FROM reviews AS r
      JOIN characteristic_reviews AS cr ON r.review_id=cr.review_id
      JOIN characteristics AS c ON c.id=cr.characteristic_id
      WHERE c.product_id=403
      GROUP BY c.id, c.name
  ) AS s
  GROUP BY s.product_id;

SELECT s.product_id::text, JSONB_OBJECT_AGG(name, characteristics) AS characteristics
  FROM (
    SELECT c.product_id, c.name,
      JSONB_BUILD_OBJECT('id', c.id, 'value', ROUND(AVG(cr.value),4)) AS characteristics
      FROM characteristic_reviews AS cr
      JOIN characteristics AS c ON c.id=cr.characteristic_id
      WHERE c.product_id=965029
      GROUP BY c.id, c.name
  ) AS s
  GROUP BY s.product_id;

-- ^^^^^ BEST OPTION SO FAR FOR CHARACTERISTICS OBJECT

-- FOR VIEWING DATA
SELECT r.review_id, c.name, cr.value
  FROM reviews AS r
  JOIN characteristics AS c ON c.product_id=r.product_id
  JOIN characteristic_reviews AS cr ON c.id=cr.characteristic_id
  WHERE c.product_id=1

SELECT r.review_id, c.name, cr.value
  FROM reviews AS r
  JOIN characteristic_reviews AS cr ON r.review_id=cr.review_id
  JOIN characteristics AS c ON c.id=cr.characteristic_id
  WHERE c.product_id=1;



-- WORKING ON RATINGS

SELECT JSONB_OBJECT_AGG(rating, ratings::text) AS ratings
FROM (
  SELECT product_id, rating, COUNT(rating) AS ratings
    FROM reviews AS r
    WHERE product_id=965029
    GROUP BY rating, product_id
) AS s
GROUP BY s.product_id;

-- ^^^^^ BEST OPTION SO FAR FOR RATINGS


-- WORKING ON RECOMMENDED

SELECT JSONB_OBJECT_AGG(recommend, recommendCnt::text) AS recommended
FROM (
  SELECT product_id, recommend, COUNT(recommend) AS recommendCnt
    FROM reviews AS r
    WHERE product_id=965029
    GROUP BY product_id, recommend
) AS s
GROUP BY s.product_id;

-- WORKING ON PUT HELPFULNESS

UPDATE reviews
SET helpfulness = helpfulness + 1
WHERE review_id=1;

-- WORKING ON POST REVIEW: REVIEW QUERY

INSERT INTO reviews (product_id, rating, date, summary, body, recommend, reviewer_name, reviewer_email)
  VALUES (965030, 5, NOW(), 'greatest product ever!', 'best purchase of all time, thanks!', true, 'chad', 'a@aol.com');
