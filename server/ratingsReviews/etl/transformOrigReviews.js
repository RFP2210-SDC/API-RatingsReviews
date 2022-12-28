const fs = require('fs');
const path = require('path');
const { parse, format } = require('fast-csv');

const inputFile = path.resolve(__dirname, '../../../rawdata/reviews.csv');
const outputFile = path.resolve(__dirname, '../../../rawdata/transformed_reviews.csv');

(async function transformCsv() {
  const writeStream = fs.createWriteStream(outputFile);

  const parseOpts = parse({
    ignoreEmpty: true,
    discardUnmappedColumns: true,
    headers: true,
  });

  const transform = format({ headers: true, quote: false })
    .transform((row) => (
      {
        id: row.id,
        product_id: row.product_id,
        rating: row.rating,
        date: (new Date(Number(row.date))).toISOString(),
        summary: `"${row.summary}"`,
        body: `"${row.body}"`,
        recommend: row.recommend,
        reported: row.reported,
        reviewer_name: `"${row.reviewer_name}"`,
        reviewer_email: `"${row.reviewer_email}"`,
        response: row.response === 'null' ? null : `"${row.response}"`,
        helpfulness: row.helpfulness,
      }
    ));

  fs.createReadStream(inputFile)
    .pipe(parseOpts)
    .pipe(transform)
    .pipe(writeStream);
}());

// fs.createReadStream(path.resolve(__dirname, 'review_test.csv'))
//   .pipe(parse({ headers: true }))
//   // pipe the parsed input into a csv formatter
//   .pipe(format({ headers: true }))
//   // Using the transform function from the formatting stream
//   .transform((row) => ({
//     id: row.id,
//     product_id: row.product_id,
//     rating: row.rating,
//     date: new Date(row.date),
//     summary: row.summary,
//     body: row.body,
//     recommend: row.recommend,
//     reported: row.reported,
//     reviewer_name: row.reviewer_name,
//     reviewer_email: row.reviewer_email,
//     response: row.response,
//     helpfulness: row.helpfulness,
//   }))
//   .pipe(process.stdout)
//   .on('end', () => process.exit());
