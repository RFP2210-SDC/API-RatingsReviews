// REQUIRE STATEMENTS
const newrelic = require('newrelic');
const app = require('./server');

// PORT AND SERVER LISTEN
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => console.log(`Server listening at http://localhost:${PORT}`));
server.setTimeout(40000);
