// eslint-disable-next-line import/no-unresolved
import http from 'k6/http';
// eslint-disable-next-line import/no-unresolved
import { check, sleep } from 'k6';

// // EXAMPLE OF VUs WITH RAMPING
// export const options = {
//   stages: [
//     { duration: '30s', target: 20 },
//     { duration: '1m30s', target: 10 },
//     { duration: '20s', target: 0 },
//   ],
// };

// // EXAMPLE OF VUs
// export const options = {
//   vus: 1,
//   duration: '30s',
// };

export const options = {
  scenarios: {
    // 5 RPS - CONSTANT
    // '5RPS': {
    //   executor: 'constant-arrival-rate',
    //   duration: '30s', // total duration
    //   preAllocatedVUs: 200, // to allocate runtime resources     preAll
    //   // rate = (desired requests rate) / (requests per iteration)
    //   rate: 5, // number of constant iterations given `timeUnit`
    //   timeUnit: '1s',
    // },

    // RAMPING
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

// TESTING SINGLE ENDPOINT - GET /reviews
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
  // WRITE POST REQUEST FOR REVIEW HERE.

  sleep((Math.random() * (6 - 1) + 1) / 1000); // random sleep btw 1 and 6 ms
}
