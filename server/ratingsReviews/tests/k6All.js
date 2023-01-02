// eslint-disable-next-line import/no-unresolved
import http from 'k6/http';
// eslint-disable-next-line import/no-unresolved
import { check, sleep } from 'k6';

export const options = {
  scenarios: {
    '10RPS': {
      executor: 'ramping-arrival-rate',
      preAllocatedVUs: 50,
      startRate: 0,
      timeUnit: '1s',
      gracefulStop: '1s',
      stages: [
        { target: 10, duration: '3s' },
        { target: 10, duration: '27s' },
      ],
    },
  },
  tags: {
    name: 'temp-test',
  },
};

// TESTING A SIMULATED USER - ALL ENDPOINTS
export default function () {
  const PRODUCT_QTY = 1000011;
  const lbID = PRODUCT_QTY * 0.9;
  const ubID = PRODUCT_QTY;
  const productId = Math.floor(Math.random() * (ubID - lbID) + lbID);

  // on page load, 2 reviews and the metadata for the current product will load.
  const res1 = http.get(`http://localhost:3000/reviews?count=2&product_id=${productId}`);
  check(res1, { 'status was 200': (r) => r.status === 200 });
  const res2 = http.get(`http://localhost:3000/reviews/meta?product_id=${productId}`);
  check(res2, { 'status was 200': (r) => r.status === 200 });

  sleep((Math.random() * (6 - 1) + 1) / 1000); // random sleep btw 1 and 6 ms

  // then, estimating 50% of users will load 2 more reviews
  const loadMoreReviews = !Math.floor(Math.random() * 2);
  if (loadMoreReviews) {
    const res3 = http.get(`http://localhost:3000/reviews?count=2&page=2&product_id=${productId}`);
    check(res3, { 'status was 200': (r) => r.status === 200 });
    const loadEvenMoreReviews = !Math.floor(Math.random() * 2);
    // then, estimating 25% of users will load 2 more reviews after that
    if (loadEvenMoreReviews) {
      const res4 = http.get(`http://localhost:3000/reviews?count=2&page=2&product_id=${productId}`);
      check(res4, { 'status was 200': (r) => r.status === 200 });
    }
  }

  // then, estimating 10% of users will POST a review
  const postReview = Math.floor(Math.random() * 9) === 0;
  // WRITE POST REQUEST FOR REVIEW HERE.

  // then, estimating 5% of users will mark a review as helpful
  const markHelpful = Math.floor(Math.random() * 19) === 0;
  // WRITE PUT REQUEST FOR REVIEW HELPFUL HERE.

  // then, estimating 0.1% of users will mark a review as helpful
  const markReported = Math.floor(Math.random() * 999) === 0;
  // WRITE PUT REQUEST FOR REVIEW HELPFUL HERE.

  sleep((Math.random() * (6 - 1) + 1) / 1000); // random sleep btw 1 and 6 ms
}
