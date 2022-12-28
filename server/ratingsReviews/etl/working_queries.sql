SELECT c.product_id,
  JSONB_OBJECT_AGG(c.name, JSONB_BUILD_OBJECT('id', c.id, 'value', cr.value)) AS characteristics
  FROM orig_reviews AS r
  JOIN orig_characteristic_reviews AS cr ON r.review_id=cr.review_id
  JOIN orig_characteristics AS c ON c.id=cr.characteristic_id
  WHERE c.product_id=1
  GROUP BY c.product_id;

-- 1 | {"Fit": {"id": 1, "value": 4}, "Length": {"id": 2, "value": 4}, "Comfort": {"id": 3, "value": 5}, "Quality": {"id": 4, "value": 4}}

SELECT r.review_id,
  JSONB_OBJECT_AGG(c.name, JSONB_BUILD_OBJECT('id', c.id, 'value', cr.value)) AS characteristics
  FROM orig_reviews AS r
  JOIN orig_characteristic_reviews AS cr ON r.review_id=cr.review_id
  JOIN orig_characteristics AS c ON c.id=cr.characteristic_id
  WHERE c.product_id=1
  GROUP BY r.review_id;

-- 1 | {"Fit": {"id": 1, "value": 4}, "Length": {"id": 2, "value": 3}, "Comfort": {"id": 3, "value": 5}, "Quality": {"id": 4, "value": 4}}
-- 2 | {"Fit": {"id": 1, "value": 4}, "Length": {"id": 2, "value": 4}, "Comfort": {"id": 3, "value": 5}, "Quality": {"id": 4, "value": 4}}

SELECT c.name, JSONB_BUILD_OBJECT('id', c.id, 'value', AVG(cr.value)) AS characteristics
  FROM orig_reviews AS r
  JOIN orig_characteristic_reviews AS cr ON r.review_id=cr.review_id
  JOIN orig_characteristics AS c ON c.id=cr.characteristic_id
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
      FROM orig_reviews AS r
      JOIN orig_characteristic_reviews AS cr ON r.review_id=cr.review_id
      JOIN orig_characteristics AS c ON c.id=cr.characteristic_id
      WHERE c.product_id=403
      GROUP BY c.id, c.name
  ) AS s
  GROUP BY s.product_id;

SELECT s.product_id, JSONB_OBJECT_AGG(name, characteristics) AS characteristics
  FROM (
    SELECT c.product_id, c.name,
      JSONB_BUILD_OBJECT('id', c.id, 'value', ROUND(AVG(cr.value),4)) AS characteristics
      FROM orig_characteristic_reviews AS cr
      JOIN orig_characteristics AS c ON c.id=cr.characteristic_id
      WHERE c.product_id=1
      GROUP BY c.id, c.name
  ) AS s
  GROUP BY s.product_id;

-- ^^^^^ BEST OPTION SO FAR FOR CHARACTERISTICS OBJECT

-- FOR VIEWING DATA
SELECT r.review_id, c.name, cr.value
  FROM orig_reviews AS r
  JOIN orig_characteristics AS c ON c.product_id=r.product_id
  JOIN orig_characteristic_reviews AS cr ON c.id=cr.characteristic_id
  WHERE c.product_id=1

SELECT r.review_id, c.name, cr.value
  FROM orig_reviews AS r
  JOIN orig_characteristic_reviews AS cr ON r.review_id=cr.review_id
  JOIN orig_characteristics AS c ON c.id=cr.characteristic_id
  WHERE c.product_id=1;



-- WORKING ON RATINGS AND RECOMMENDED

SELECT JSONB_OBJECT_AGG(rating, ratings) AS ratings
FROM (
  SELECT product_id, rating, COUNT(rating) AS ratings
    FROM orig_reviews AS r
    WHERE product_id=2
    GROUP BY rating, product_id
) AS s
GROUP BY s.product_id;

-- ^^^^^ BEST OPTION SO FAR FOR RATINGS