// import pkg from "pg";
// const { Pool } = pkg;

// export const pool = new Pool({
//   user: "postgres",
//   host: "localhost",
//   database: "approval_db",
//   password: "root",
//   port: 5432,
// });

import pg from "pg";
import dotenv from "dotenv";
dotenv.config();

const config = {
  connectionString: process.env.DATABASE_URL,
};

export const pool = new pg.Pool(config);
