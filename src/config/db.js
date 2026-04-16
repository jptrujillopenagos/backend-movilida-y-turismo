/*const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

pool.connect()
  .then(() => console.log('PostgreSQL conectado ✅'))
  .catch(err => console.error('Error conectando a PostgreSQL:', err));

module.exports = pool;*/




/*para que vuelva correr online debo de quital los documentadores y documentar lo que esta arriba */

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

console.log('Supabase cliente iniciado ✅');

module.exports = supabase;