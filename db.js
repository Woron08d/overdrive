import pg from 'pg';

const useSsl = { rejectUnauthorized: false };

const connection = process.env.DATABASE_URL
  ? { connectionString: process.env.DATABASE_URL, ssl: useSsl }
  : {
      host: 'localhost',
      port: 5432,
      database: 'overdrive',
      user: 'postgres',
      password: '123'
    };

const pool = new pg.Pool(connection);
export function query(sql, params) {
  return pool.query(sql, params);
}
export default pool;