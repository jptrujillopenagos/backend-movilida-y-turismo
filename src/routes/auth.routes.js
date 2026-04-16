/*const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const SECRET = process.env.JWT_SECRET || 'lago_tota_secret';

// ==========================
// 🟢 REGISTRO
// ==========================
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: 'Todos los campos son obligatorios' });

    // Verificar si ya existe
    const exists = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (exists.rows.length > 0)
      return res.status(400).json({ message: 'El correo ya está registrado' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await pool.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email, role',
      [name, email, hashedPassword]
    );

    const user = newUser.rows[0];
    const token = jwt.sign({ id: user.id, email: user.email }, SECRET, { expiresIn: '7d' });

    res.json({ message: 'Usuario creado correctamente', token, user });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// ==========================
// 🔵 LOGIN
// ==========================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: 'Correo y contraseña requeridos' });

    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1', [email]
    );

    if (result.rows.length === 0)
      return res.status(400).json({ message: 'Usuario no encontrado' });

    const userRow = result.rows[0];
    const validPassword = await bcrypt.compare(password, userRow.password);

    if (!validPassword)
      return res.status(400).json({ message: 'Contraseña incorrecta' });

    // ✅ Devolver token + user sin exponer password
    const token = jwt.sign({ id: userRow.id, email: userRow.email }, SECRET, { expiresIn: '7d' });

    const user = {
      id:    userRow.id,
      name:  userRow.name,
      email: userRow.email,
      role:  userRow.role,
    };

    res.json({ message: 'Login exitoso', token, user });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

module.exports = router;*/





/*para que vuelva correr online debo de quital los documentadores y documentar lo que esta arriba */
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../config/db');

const SECRET = process.env.JWT_SECRET || 'lago_tota_secret';

// ==========================
// 🟢 REGISTRO
// ==========================
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: 'Todos los campos son obligatorios' });

    // Verificar si ya existe
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existing)
      return res.status(400).json({ message: 'El correo ya está registrado' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const { data: user, error } = await supabase
      .from('users')
      .insert([{ name, email, password: hashedPassword }])
      .select('id, name, email, role')
      .single();

    if (error) throw error;

    const token = jwt.sign({ id: user.id, email: user.email }, SECRET, { expiresIn: '7d' });

    res.json({ message: 'Usuario creado correctamente', token, user });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// ==========================
// 🔵 LOGIN
// ==========================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: 'Correo y contraseña requeridos' });

    const { data: userRow, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (!userRow || error)
      return res.status(400).json({ message: 'Usuario no encontrado' });

    const validPassword = await bcrypt.compare(password, userRow.password);

    if (!validPassword)
      return res.status(400).json({ message: 'Contraseña incorrecta' });

    const token = jwt.sign({ id: userRow.id, email: userRow.email }, SECRET, { expiresIn: '7d' });

    const user = {
      id:    userRow.id,
      name:  userRow.name,
      email: userRow.email,
      role:  userRow.role,
    };

    res.json({ message: 'Login exitoso', token, user });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

module.exports = router;