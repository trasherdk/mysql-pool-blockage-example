import { MysqlGateway } from './mysql-gateway';
import util from 'util';

export const transactify = async (
  asyncTransaction: () => Promise<any>,
  db: MysqlGateway
) => {
  try {
    if (db.transacting !== null) {
      return asyncTransaction();
    }

    const getConnection = util.promisify(db.pool.getConnection.bind(db.pool));
    const connection = await getConnection();

    const query = util.promisify(connection.query.bind(connection));
    await query('SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED');

    const beginTransaction = util.promisify(
      connection.beginTransaction.bind(connection)
    );
    await beginTransaction();

    db.transacting = connection;

    const res = await asyncTransaction();
    const commit = util.promisify(connection.commit.bind(connection));
    await commit();

    db.transacting = null;
    connection.release();
    console.log('transaction commited');

    return res;
  } catch (error) {
    console.error('Catched in our handler', error);
    if (db.transacting) {
      const rollback = util.promisify(
        db.transacting.rollback.bind(db.transacting)
      );
      await rollback();
      console.log('transaction was rolledback');

      db.transacting.release();
      db.transacting = null;
    }

    throw error;
  }
};
