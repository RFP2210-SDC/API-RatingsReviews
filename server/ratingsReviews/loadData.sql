COPY reviews FROM '/Users/chadfusco/Library/CloudStorage/GoogleDrive-mustrunfaster@gmail.com/Other computers/My Laptop/Current Folder/Coding Career/Coding Education/Hack Reactor SEI/API-RatingsReviews/rawdata/reviews.csv' WITH (HEADER true);

-- If COPY doesn't work due to file permissions, replace COPY above with \copy, and paste the whole thing into the psql CLI.