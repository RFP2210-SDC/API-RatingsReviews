// eslint-disable-next-line import/no-unresolved
import http from 'k6/http';
// eslint-disable-next-line import/no-unresolved
import { check, sleep } from 'k6';

const testName = 'postReviewIteration0-05';

const RPS = 3600;
const scenarios = {};
const scenario = {
  executor: 'ramping-arrival-rate',
  preAllocatedVUs: 500,
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

// TESTING SINGLE ENDPOINT - POST /reviews
export default function () {
  const PRODUCT_QTY = 1000011;
  const lbID = PRODUCT_QTY * 0.9;
  const ubID = PRODUCT_QTY;
  const productId = Math.floor(Math.random() * (ubID - lbID) + lbID);

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

  sleep((Math.random() * (6 - 1) + 1) / 1000); // random sleep btw 1 and 6 ms
}
