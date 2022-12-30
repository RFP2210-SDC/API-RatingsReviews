/* eslint-disable no-undef */
// After running "npm test", open up coverage/lcov-report/index.html to see full coverage report.
process.env.NODE_ENV = 'test';
const app = require('../server');
// eslint-disable-next-line import/order
const request = require('supertest');
const { db } = require('../db');

let server;
let agent;

beforeAll(async () => {
  server = await app.listen(4000);
  agent = await request.agent(server);
  await db.query('DROP TABLE IF EXISTS test_characteristic_reviews');
  await db.query('DROP TABLE IF EXISTS test_reviews_photos');
  await db.query('DROP TABLE IF EXISTS test_characteristics');
  await db.query('DROP TABLE IF EXISTS test_reviews');
  await db.query('CREATE TABLE test_reviews (LIKE reviews INCLUDING ALL)');
  await db.query('CREATE TABLE test_characteristics (LIKE characteristics INCLUDING ALL)');
  await db.query('CREATE TABLE test_reviews_photos (LIKE reviews_photos INCLUDING ALL)');
  await db.query('CREATE TABLE test_characteristic_reviews (LIKE characteristic_reviews INCLUDING ALL)');
  return db.query('INSERT INTO test_characteristics (product_id, name) '
      + "VALUES (1, 'Fit'), (1, 'Length'), (1, 'Comfort'), (1, 'Quality'), (2, 'Quality')");
});

afterAll(async () => {
  await db.query('DROP TABLE IF EXISTS test_characteristic_reviews');
  await db.query('DROP TABLE IF EXISTS test_reviews_photos');
  await db.query('DROP TABLE IF EXISTS test_characteristics');
  await db.query('DROP TABLE IF EXISTS test_reviews');
  await server.close();
  return db.end();
});

describe('POST /reviews ', () => {
  test('It should respond with status code 201 when posting review', async () => {
    const response = await agent.post('/reviews')
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
