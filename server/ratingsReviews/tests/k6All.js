// eslint-disable-next-line import/no-unresolved
import http from 'k6/http';
// eslint-disable-next-line import/no-unresolved
import { check, sleep } from 'k6';

const testName = 'postReviewIteration0-04';

const RPS = 2;
const scenarios = {};
const scenario = {
  executor: 'ramping-arrival-rate',
  preAllocatedVUs: 400,
  startRate: 0,
  timeUnit: '1s',
  gracefulStop: '1s',
  stages: [
    { target: RPS, duration: '3s' },
    { target: RPS, duration: '27s' },
  ],
};
scenarios[`${RPS}RPS`] = scenario;
export const options = {
  scenarios,
  tags: {
    testName,
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

  sleep(5000);

  // then, estimating 50% of users will load 2 more reviews
  const loadMoreReviews = !Math.floor(Math.random() * 2);
  if (loadMoreReviews) {
    const res3 = http.get(`http://localhost:3000/reviews?count=2&page=2&product_id=${productId}`);
    check(res3, { 'status was 200': (r) => r.status === 200 });
    const loadEvenMoreReviews = !Math.floor(Math.random() * 2);
    // then, estimating 25% of users will load 2 more reviews after that
    if (loadEvenMoreReviews) {
      sleep(5000);
      const res4 = http.get(`http://localhost:3000/reviews?count=2&page=2&product_id=${productId}`);
      check(res4, { 'status was 200': (r) => r.status === 200 });
    }
  }

  // then, estimating 10% of users will POST a review
  const postReview = Math.floor(Math.random() * 9) === 0;
  if (postReview) {
    sleep(60000);
    const url = 'http://localhost:3000/reviews';
    const payload = JSON.stringify({
      product_id: productId,
      rating: 3,
      summary: testName,
      body: 'Lorem ipsum dolor sit amet consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes nascetur ridiculus mus. Donec qu',
      recommend: true,
      name: 'mr nobody',
      email: 'nobody@yahoo.com',
      photos: ['test1', 'test2'],
      // eslint-disable-next-line object-curly-newline
      characteristics: { 1: 1, 2: 1, 3: 1, 4: 1 },
    });
    const params = {
      headers: {
        'Content-Type': 'application/json',
      },
    };
    const res = http.post(url, payload, params);
    check(res, { 'status was 201': (r) => r.status === 201 });
  }

  // then, estimating 5% of users will mark a review as helpful
  const markHelpful = Math.floor(Math.random() * 19) === 0;
  // WRITE PUT REQUEST FOR REVIEW HELPFUL HERE.

  // then, estimating 0.1% of users will mark a review as helpful
  const markReported = Math.floor(Math.random() * 999) === 0;
  // WRITE PUT REQUEST FOR REVIEW HELPFUL HERE.

  sleep((Math.random() * (6 - 1) + 1) / 1000); // random sleep btw 1 and 6 ms
}
