/*const router = require('express').Router();
const db = require('../config/db');
const verifyToken = require('../middleware/auth');

// =========================
// 🏨 OBTENER ALOJAMIENTOS PÚBLICOS
// =========================
router.get('/public', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT id, name, description, location, price, image_url
      FROM accommodations
      ORDER BY id DESC
    `);

    res.json(result.rows);

  } catch (error) {
    console.error("ERROR PUBLIC:", error);
    res.status(500).json({ error: 'Error obteniendo alojamientos' });
  }
});

// =========================
// ➕ CREAR ALOJAMIENTO (protegido)
// =========================
router.post('/', verifyToken, async (req, res) => {
  try {
    const { name, description, location, price, image_url } = req.body;

    const user_id = req.user.id;

    if (!name || !description || !location || !price) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    if (isNaN(price) || price <= 0) {
      return res.status(400).json({ error: 'El precio debe ser un número positivo' });
    }

    const result = await db.query(
      `INSERT INTO accommodations 
      (user_id, name, description, location, price, image_url)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`,
      [user_id, name, description, location, price, image_url]
    );

    res.status(201).json(result.rows[0]);

  } catch (error) {
    console.error("ERROR CREATE:", error);
    res.status(500).json({ error: 'Error creando alojamiento' });
  }
});

module.exports = router;*/
const router = require('express').Router();
const supabase = require('../config/db');
const verifyToken = require('../middleware/auth');

// =========================
// 🏨 OBTENER ALOJAMIENTOS PÚBLICOS
// =========================
router.get('/public', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('accommodations')
      .select('id, name, description, location, price, image_url')
      .order('id', { ascending: false });

    if (error) throw error;

    res.json(data);

  } catch (error) {
    console.error("ERROR PUBLIC:", error);
    res.status(500).json({ error: 'Error obteniendo alojamientos' });
  }
});

// =========================
// ➕ CREAR ALOJAMIENTO (protegido)
// =========================
router.post('/', verifyToken, async (req, res) => {
  try {
    const { name, description, location, price, image_url } = req.body;
    const user_id = req.user.id;

    if (!name || !description || !location || !price)
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });

    if (isNaN(price) || price <= 0)
      return res.status(400).json({ error: 'El precio debe ser un número positivo' });

    const { data, error } = await supabase
      .from('accommodations')
      .insert([{ user_id, name, description, location, price, image_url }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);

  } catch (error) {
    console.error("ERROR CREATE:", error);
    res.status(500).json({ error: 'Error creando alojamiento' });
  }
});

module.exports = router;