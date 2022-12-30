// After running "npm test", open up coverage/lcov-report/index.html to see full coverage report.
const request = require('supertest');
const db = require('../db');
const app = require('../server');

let client;
let release;

beforeAll(() => {
  db.getConnection((err, dbClient, dbRelease) => {
    if (err) {
      console.log('database connection failed');
    } else {
      client = dbClient;
      release = dbRelease;
      client.query('CREATE TABLE test_reviews (LIKE reviews INCLUDING ALL)');
      client.query('CREATE TABLE test_characteristics (LIKE characteristics INCLUDING ALL)');
      client.query('CREATE TABLE test_reviews_photos (LIKE reviews_photos INCLUDING ALL)');
      client.query('CREATE TABLE test_characteristic_reviews (LIKE characteristic_reviews INCLUDING ALL)');
    }
  });
});

afterAll(async () => {
  release();
});

test('It adds two numbers', () => {
  expect(1 + 1).toBe(2);
});

describe("GET / ", () => {
  test("It should respond with an array of students", async () => {
    const response = await request(app).get('/students');
    expect(response.body).toEqual(['Elie', 'Matt', 'Joel', 'Michael']);
    expect(response.statusCode).toBe(200);
  });
});
