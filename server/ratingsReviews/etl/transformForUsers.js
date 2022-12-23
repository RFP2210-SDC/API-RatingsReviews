const fs = require('fs');
const path = require('path');
const { parse, format } = require('fast-csv');

const inputFile = path.resolve(__dirname, '../../../rawdata/reviews.csv');
const outputFile = path.resolve(__dirname, '../../../rawdata/transformed_forUsers.csv');

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
        reviewer_name: `"${row.reviewer_name}"`,
        reviewer_email: `"${row.reviewer_email}"`,
      }
    ));

  fs.createReadStream(inputFile)
    .pipe(parseOpts)
    .pipe(transform)
    .pipe(writeStream);
}());
