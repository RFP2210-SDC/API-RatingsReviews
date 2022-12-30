/* eslint-disable no-undef */
// After running "npm test", open up coverage/lcov-report/index.html to see full coverage report.
const request = require('supertest');
const db = require('../db');
const app = require('../server');

let client;
let release;

function dropTbls() {
  return client.query('DROP TABLE test_characteristic_reviews')
    .then(() => (client.query('DROP TABLE test_reviews_photos')))
    .then(() => (client.query('DROP TABLE test_characteristics')))
    .then(() => (client.query('DROP TABLE test_reviews')));
}

beforeAll(() => {
  db.getConnection((err, dbClient, dbRelease) => {
    if (err) {
      console.log('database connection failed');
    } else {
      client = dbClient;
      release = dbRelease;
      dropTbls()
        .then(() => (client.query('CREATE TABLE test_reviews '
        + '(LIKE reviews INCLUDING ALL)')))
        .then(() => (client.query('CREATE TABLE test_characteristics '
          + '(LIKE characteristics INCLUDING ALL)')))
        .then(() => (client.query('CREATE TABLE test_reviews_photos '
          + '(LIKE reviews_photos INCLUDING ALL)')))
        .then(() => (client.query('CREATE TABLE test_characteristic_reviews '
          + '(LIKE characteristic_reviews INCLUDING ALL)')))
        .then(() => (client.query('INSERT INTO test_characteristics (product_id, name) '
          + 'VALUES (1, "Fit"), (1, "Length"), (1, "Comfort"), (1, "Quality"), (2, "Quality")')));
    }
  });
});

afterAll(async () => {
  dropTbls()
    .finally(release());
});

describe('POST /reviews ', () => {
  test('It should respond with status code 201 when posting review', async () => {
    const response = await request(app).post('/reviews')
      .send({
        product_id: 1,
        rating: 1,
        summary: 'totally life changing',
        body: "Best thing I've ever purchased. Also, Team Fendi is killing it right now.",
        recommend: true,
        name: 'test',
        email: 'test@email.com',
        photos: ['testPhoto1', 'testPhoto2'],
        characteristics: {
          1: 1, 2: 1, 3: 1, 4: 1,
        },
      });
    expect(response.statusCode).toBe(201);
  });
});

test('It adds two numbers', () => {
  expect(1 + 1).toBe(2);
});

describe('GET / ', () => {
  test('It should respond with an array of students', async () => {
    const response = await request(app).get('/students');
    expect(response.body).toEqual(['Elie', 'Matt', 'Joel', 'Michael']);
    expect(response.statusCode).toBe(200);
  });
});
