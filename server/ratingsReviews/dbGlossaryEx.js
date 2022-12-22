const mongoose = require("mongoose");

// 1. Use mongoose to establish a connection to MongoDB
// 2. Set up any schema and models needed by the app
// 3. Export the models
// 4. Import the models into any modules that need them

mongoose.connect('mongodb://localhost:27017/glossary');

console.log('inside db.js');

const glossarySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  definition: { type: String, required: true }
})

// setting up model, which is analagous to a "Collection" in MongoDB.
const Glossary = mongoose.model('Glossary', glossarySchema);

// SEED GLOSSARY WITH INITIAL VALUES IF NO DOCUMENTS EXIST IN DB
let startingGlossary = [
  { name: 'Ainur', definition: 'Gods created by Illuvator before the creation of Arda' },
  { name: 'Eldar', definition: 'Elves, also known as the Quendi, or the Firstborn Children of Eru Illuvatar'},
  { name: 'Moriquendi', definition: 'Elves who have not seen the light of Aman'},
  { name: 'Calaquendi', definition: 'Elves who have seen the light of the Two Trees in Valinor'}
];

Glossary.countDocuments({}, (err, count) => {
  if (!count) {
    Glossary.insertMany(startingGlossary, function(err) {
      if (err) {
        console.log('err:', err);
      } else {
        console.log('startingGlossary successfully saved!')
      }
    })
  }
})

module.exports = Glossary;