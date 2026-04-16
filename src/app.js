/*require('dotenv').config();
const express = require('express');
const cors = require('cors');

const db = require('./config/db');

const app = express();

// =========================
// 🔹 CORS (SUFICIENTE 🔥)
// =========================
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

// =========================
// 🔹 MIDDLEWARES
// =========================
app.use(express.json());

// =========================
// 🔹 RUTAS
// =========================
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/accommodations', require('./routes/accommodations.routes'));
app.use('/api/reservations', require('./routes/reservations'));

// =========================
// 🔹 TEST
// =========================
app.get('/', (req, res) => {
  res.send('API funcionando 🚀');
});

app.get('/db-test', async (req, res) => {
  try {
    const result = await db.query('SELECT NOW()');
    res.json({
      message: 'DB conectada',
      time: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({ error: 'Error DB' });
  }
});

// =========================
// 🔹 ERROR GLOBAL
// =========================
app.use((err, req, res, next) => {
  console.error('ERROR GLOBAL:', err);
  res.status(500).json({ error: 'Error interno' });
});

// =========================
// 🔹 SERVER
// =========================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT}`);
});*/



/*para que vuelva correr online debo de quital los documentadores y documentar lo que esta  */
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const supabase = require('./config/db');

const app = express();

// =========================
// 🔹 CORS
// =========================
app.use(cors({
  origin: '*',
  credentials: false
}));

// =========================
// 🔹 MIDDLEWARES
// =========================
app.use(express.json());

// =========================
// 🔹 RUTAS
// =========================
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/accommodations', require('./routes/accommodations.routes'));
app.use('/api/reservations', require('./routes/reservations'));

// =========================
// 🔹 TEST
// =========================
app.get('/', (req, res) => {
  res.send('API funcionando 🚀');
});

app.get('/db-test', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('accommodations')
      .select('id')
      .limit(1);

    if (error) throw error;

    res.json({ message: 'Supabase conectado ✅', data });
  } catch (error) {
    res.status(500).json({ error: 'Error DB' });
  }
});

// =========================
// 🔹 ERROR GLOBAL
// =========================
app.use((err, req, res, next) => {
  console.error('ERROR GLOBAL:', err);
  res.status(500).json({ error: 'Error interno' });
});

// =========================
// 🔹 SERVER
// =========================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT}`);
});