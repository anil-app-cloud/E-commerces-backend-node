//ip addr show eth0 | grep inet | awk '{ print $2; }' | sed 's/\/.*$//'
const mysql = require('mysql2/promise');
require('dotenv').config();
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 100,
  queueLimit: 0
});

const dbConnect = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Database connection established');
    return connection;
  } catch (error) {
    console.error('Database connection failed:', error);
    return null;
  }
};
dbConnect()
module.exports = pool;


