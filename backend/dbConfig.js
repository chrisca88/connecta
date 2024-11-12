const sql = require('mssql');
const dotenv = require('dotenv');


dotenv.config();


const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  options: {
    encrypt: true, 
    enableArithAbort: true,
    trustServerCertificate: true,
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 1433
  },
};

let pool;


const connectToDB = async () => {
  try {
    if (!pool) {
      pool = await sql.connect(dbConfig);
      console.log('Conectado a la base de datos SQL Server');
    }
    return pool;
  } catch (error) {
    console.error('Error al conectar a la base de datos:', error);
    throw error;
  }
};

module.exports = { connectToDB, sql };
