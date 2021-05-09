import express from 'express';
import dotenv from 'dotenv';
dotenv.config();

import { pool } from './src/mysql-pool';
import { MysqlGateway } from './src/mysql-gateway';
import { transactify } from './src/transactify';

/**
 * Create the express application
 */
const app = express();

// /**
//  * Attach middleware to get a connection from the pool and attach it to the req.app object
//  */
// app.use((req, _res, next) => {
//   pool.getConnection((err, connection) => {
//     if (err) {
//       return next(err);
//     }
//     req.app.set('connection', connection);

//     next();
//   });
// });

// /**
//  * Attach middleware to release back to the pool the connection once the request is closed
//  */
// app.use((req, _res, next) => {
//   req.once('close', () => {
//     const connection = req.app.get('connection');

//     if (connection) {
//       connection.release();
//     }
//     req.app.set('connection', null);
//   });
//   next();
// });

app.get('/', async (req, res, next) => {
  const db = new MysqlGateway(pool);

  try {
    const result = await transactify(() => {
      return transactify(() => {
        // if (Math.random() > 0.5) {
        //   throw new Error('Some error in the query');
        // }

        return db.query('SELECT 1 + 1');
      }, db);
    }, db);

    res.json(result);
  } catch (err) {
    next(err);
  }
});

app.get('/without', async (req, res, next) => {
  const db = new MysqlGateway(pool);

  try {
    const result = await db.query(`SELECT 1+1 as two`);

    res.json(result);
  } catch (err) {
    next(err);
  }
});

app.listen(3000, () => {
  console.log('Server is running at http://localhost:3000/');
});
