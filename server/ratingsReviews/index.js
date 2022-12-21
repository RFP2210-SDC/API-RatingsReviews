const { Client } = require('pg');

const client = new Client();
client.connect();

console.log('hello Chad');
async function testing() {
  console.log('hello Chad 2');
  const res = await client.query('SELECT $1::text as message', ['Hello world!']);
  console.log(res.rows[0].message); // Hello world!
  await client.end();
}

testing();
console.log('hello Chad 3');

module.exports = client;
