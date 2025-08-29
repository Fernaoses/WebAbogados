const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL;

const useSSL = connectionString && !/localhost|127\.0\.0\.1/.test(connectionString);

const pool = new Pool({
  connectionString,
  ssl: useSSL ? { rejectUnauthorized: false } : false,
});

module.exports = pool;
