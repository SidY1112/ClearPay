// File responsible for creating and exporting a connection pool to the PostgreSQL database
// Pool creates 10 active connections, any connections after must wait in a queue

const {Pool} = require('pg'); // We are importing from the library pg however we just want the specific part "pool" from pg
require('dotenv').config(); // require gets the dotenv object and then from that returned object we call .config() on it

// Creating an instance of the Pool class called pool
const pool = new Pool(
  {
  // These are official keys expected by the pg library when you create a new Pool()
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  ssl: {rejectUnauthorized: false} //AWS RDS requires SSL, but we're skipping certificate verification
  //max: 20 Incase we want to add more connections
}
)

// In Node.js, every file is its own module.
// If you want to share a variable, function, or object from one file to another, you use:
module.exports = pool
