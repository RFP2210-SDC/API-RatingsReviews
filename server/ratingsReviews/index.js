const { Client } = require('pg');

const client = new Client();
client.connect();

async function testing() {
  const res = await client.query('SELECT $1::text as message', ['Hello world!']);
  console.log(res.rows[0].message); // Hello world!
  await client.end();
}

testing();

// async function setupDatabase() {
//   client.query('CREATE DATABASE IF NOT EXISTS reviews')
//     .then(client.query(`CREATE TABLE IF NOT EXISTS metadata (
//       id INT NOT NULL PRIMARY KEY,
//       ratings
//     )`));
// }

module.exports = client;
