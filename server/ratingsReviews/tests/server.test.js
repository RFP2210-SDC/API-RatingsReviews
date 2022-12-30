/* eslint-disable no-undef */
// After running "npm test", open up coverage/lcov-report/index.html to see full coverage report.
process.env.NODE_ENV = 'test';
const request = require('supertest');
const { db } = require('../db');
const app = require('../server');

beforeAll(async () => {
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
  return db.end();
});

const body = "Best thing I've ever purchased. Also, Team Fendi is killing it right now.";

describe('POST /reviews', () => {
  test('It should respond with status code 201 when posting review', async () => {
    const response = await request(app).post('/reviews')
      .send({
        product_id: 1,
        rating: 1,
        summary: 'totally life changing',
        body,
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

describe('GET /reviews', () => {
  test('It should respond with posted review', async () => {
    const response = await request(app).get('/reviews?product_id=1');
    expect(response.body.results.length).toBe(1);
    expect(response.body.results[0].body).toBe(body);
    expect(response.body.results[0].recommend).toBe(true);
  });
});

describe('GET /reviews/meta', () => {
  test('It should respond with the correct characteristics', async () => {
    const response = await request(app).get('/reviews/meta?product_id=1');
    expect(response.body.characteristics.Fit.value).toBe(1);
    expect(response.body.characteristics.Length.value).toBe(1);
    expect(response.body.characteristics.Comfort.value).toBe(1);
    expect(response.body.characteristics.Quality.value).toBe(1);
  });

  test('It should respond with the correct ratings', async () => {
    await request(app).post('/reviews')
      .send({
        product_id: 1,
        rating: 2,
        summary: 'greatest thing since sliced bread',
        body,
        recommend: true,
        name: 'test2',
        email: 'test2@email.com',
        photos: ['testPhoto3', 'testPhoto4'],
        characteristics: {
          1: 4, 2: 4, 3: 4, 4: 4,
        },
      });
    const response = await request(app).get('/reviews/meta?product_id=1');
    expect(response.body.ratings[1]).toBe('1');
    expect(response.body.ratings[2]).toBe('1');
  });
});

describe('PUT /reviews/2/helpful', () => {
  test('It should respond increase helpfulness to 1', async () => {
    await request(app).put('/reviews/2/helpful');
    const response = await request(app).get('/reviews?product_id=1&sort=newest');
    expect(response.body.results[0].helpfulness).toBe(1);
  });
});

describe('PUT /reviews/2/report', () => {
  test('It should not return a reported review', async () => {
    await request(app).put('/reviews/1/report');
    const response = await request(app).get('/reviews?product_id=1');
    expect(response.body.results.length).toBe(1);
  });
});
