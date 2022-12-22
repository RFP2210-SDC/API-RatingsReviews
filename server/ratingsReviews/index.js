const { Client } = require('pg');

const client = new Client();
client.connect();

async function testing() {
  const res = await client.query('SELECT $1::text as message', ['Hello world!']);
  console.log(res.rows[0].message); // Hello world!
  await client.end();
}

testing();

module.exports = client;
