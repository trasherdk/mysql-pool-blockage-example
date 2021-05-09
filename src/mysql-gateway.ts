import { Pool, PoolConnection } from 'mysql';
import { promisify } from 'util';

export class MysqlGateway {
  public transacting: PoolConnection | null = null;

  constructor(public pool: Pool) {}

  public async query(query: string): Promise<any> {
    const queryable = this.transacting || this.pool;
    const promiseQuery = promisify<string>(queryable.query.bind(queryable));

    try {
      const result = await promiseQuery(query);
      return result;
    } catch (e) {
      if (e.code === 'ER_LOCK_DEADLOCK') {
        return this.query(query);
      } else {
        console.log({ SQL_ERROR: e });
        throw e;
      }
    }
  }
}
