// eslint-disable-next-line import/no-unresolved
import http from 'k6/http';
// eslint-disable-next-line import/no-unresolved
import { check, sleep } from 'k6';

export const options = {
  scenarios: {
    '2RPS': {
      executor: 'ramping-arrival-rate',
      preAllocatedVUs: 50,
      startRate: 0,
      timeUnit: '1s',
      gracefulStop: '1s',
      stages: [
        { target: 2, duration: '3s' },
        { target: 2, duration: '27s' },
      ],
    },
  },
  tags: {
    name: 'metadataIteration1',
  },
};

// TESTING SINGLE ENDPOINT - GET /reviews/meta
export default function () {
  const PRODUCT_QTY = 1000011;
  const lbID = PRODUCT_QTY * 0.9;
  const ubID = PRODUCT_QTY;
  const productId = Math.floor(Math.random() * (ubID - lbID) + lbID);

  const res = http.get(`http://localhost:3000/reviews/meta?product_id=${productId}`);
  check(res, { 'status was 200': (r) => r.status === 200 });

  sleep((Math.random() * (6 - 1) + 1) / 1000); // random sleep btw 1 and 6 ms
}
