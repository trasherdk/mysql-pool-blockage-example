/** Initializing a pool to connect to mysql driver */

import { createPool } from 'mysql';

export const pool = createPool({
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  connectionLimit: 10,
});

export { PoolConnection } from 'mysql';
