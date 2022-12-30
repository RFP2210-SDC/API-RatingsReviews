// REQUIRE STATEMENTS
const app = require('./server');

// PORT AND SERVER LISTEN
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening at http://localhost:${PORT}`));
