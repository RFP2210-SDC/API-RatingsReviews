// eslint-disable-next-line import/no-unresolved
import http from 'k6/http';
// eslint-disable-next-line import/no-unresolved
import { check, sleep } from 'k6';

// // EXAMPLE OF VUs
// export const options = {
//   vus: 1,
//   duration: '30s',
// };

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
    '3RPS': {
      executor: 'ramping-arrival-rate',
      preAllocatedVUs: 50,
      startRate: 0,
      timeUnit: '1s',
      stages: [
        { target: 3, duration: '2s' },
        { target: 3, duration: '28s' },
      ],
    },
  },
  tags: {
    name: 'Iteration1-02',
  },
};

// TESTING SINGLE ENDPOINT - GET /reviews
export default function () {
  const PRODUCT_QTY = 1000011;
  const lbID = PRODUCT_QTY * 0.9;
  const ubID = PRODUCT_QTY;
  const productId = Math.floor(Math.random() * (ubID - lbID) + lbID);
  const res = http.get(`http://localhost:3000/reviews?count=2&product_id=${productId}`);
  check(res, { 'status was 200': (r) => r.status === 200 });
  sleep((Math.random() * (6 - 1) + 1) / 1000); // random sleep btw 1 and 6 ms
}

// export function handleSummary(data) {
//   return {
//     "summary.html": htmlReport(data),
//   };
// }
