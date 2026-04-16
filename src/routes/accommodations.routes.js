/*const router = require('express').Router();
const db = require('../config/db');
const verifyToken = require('../middleware/auth');

// =========================
// 🏨 OBTENER ALOJAMIENTOS PÚBLICOS
// =========================
router.get('/public', async (req, res) => {
  try {
    // Trae alojamientos con sus imágenes en un solo query
    const result = await db.query(`
      SELECT 
        a.id,
        a.name,
        a.description,
        a.location,
        a.price,
        a.image_url,
        COALESCE(
          JSON_AGG(ai.image_url ORDER BY ai.sort_order ASC)
          FILTER (WHERE ai.image_url IS NOT NULL),
          '[]'
        ) AS images
      FROM accommodations a
      LEFT JOIN accommodation_images ai ON ai.accommodation_id = a.id
      GROUP BY a.id
      ORDER BY a.id DESC
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

    const newAcc = result.rows[0];

    // Si viene image_url, la guardamos también en accommodation_images
    if (image_url) {
      await db.query(
        `INSERT INTO accommodation_images (accommodation_id, image_url, sort_order)
         VALUES ($1, $2, 0)`,
        [newAcc.id, image_url]
      );
    }

    res.status(201).json(newAcc);

  } catch (error) {
    console.error("ERROR CREATE:", error);
    res.status(500).json({ error: 'Error creando alojamiento' });
  }
});

// =========================
// 🖼️ OBTENER IMÁGENES DE UN ALOJAMIENTO (admin)
// =========================
router.get('/:id/images', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `SELECT id, image_url, sort_order
       FROM accommodation_images
       WHERE accommodation_id = $1
       ORDER BY sort_order ASC`,
      [id]
    );

    res.json(result.rows);

  } catch (error) {
    console.error("ERROR GET IMAGES:", error);
    res.status(500).json({ error: 'Error obteniendo imágenes' });
  }
});

// =========================
// ➕ AGREGAR IMAGEN A UN ALOJAMIENTO (admin)
// =========================
router.post('/:id/images', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { image_url, sort_order = 0 } = req.body;

    if (!image_url) {
      return res.status(400).json({ error: 'image_url es requerida' });
    }

    // Verificar que el alojamiento le pertenece al usuario
    const acc = await db.query(
      'SELECT id FROM accommodations WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (!acc.rows.length) {
      return res.status(403).json({ error: 'No autorizado' });
    }

    const result = await db.query(
      `INSERT INTO accommodation_images (accommodation_id, image_url, sort_order)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [id, image_url, sort_order]
    );

    res.status(201).json(result.rows[0]);

  } catch (error) {
    console.error("ERROR ADD IMAGE:", error);
    res.status(500).json({ error: 'Error agregando imagen' });
  }
});

// =========================
// 🗑️ ELIMINAR IMAGEN (admin)
// =========================
router.delete('/images/:imageId', verifyToken, async (req, res) => {
  try {
    const { imageId } = req.params;

    // Verificar que la imagen le pertenece al usuario logueado
    const check = await db.query(
      `SELECT ai.id FROM accommodation_images ai
       JOIN accommodations a ON a.id = ai.accommodation_id
       WHERE ai.id = $1 AND a.user_id = $2`,
      [imageId, req.user.id]
    );

    if (!check.rows.length) {
      return res.status(403).json({ error: 'No autorizado' });
    }

    await db.query('DELETE FROM accommodation_images WHERE id = $1', [imageId]);

    res.json({ ok: true, message: 'Imagen eliminada' });

  } catch (error) {
    console.error("ERROR DELETE IMAGE:", error);
    res.status(500).json({ error: 'Error eliminando imagen' });
  }
});

module.exports = router;*/

/*para que vuelva correr online debo de quital los documentadores y documentar lo que esta arriba */
const router = require('express').Router();
const supabase = require('../config/db');
const verifyToken = require('../middleware/auth');

// =========================
// 🏨 OBTENER ALOJAMIENTOS PÚBLICOS
// =========================
router.get('/public', async (req, res) => {
  try {
    const { data: accommodations, error } = await supabase
      .from('accommodations')
      .select(`
        id,
        name,
        description,
        location,
        price,
        image_url,
        accommodation_images (
          image_url,
          sort_order
        )
      `)
      .order('id', { ascending: false });

    if (error) throw error;

    // Ordenar imágenes por sort_order y exponerlas como array plano
    const result = accommodations.map(acc => ({
      ...acc,
      images: (acc.accommodation_images || [])
        .sort((a, b) => a.sort_order - b.sort_order)
        .map(img => img.image_url),
      accommodation_images: undefined, // limpiar campo interno
    }));

    res.json(result);

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

    // Si viene image_url, migrarla también a accommodation_images
    if (image_url) {
      await supabase
        .from('accommodation_images')
        .insert([{ accommodation_id: data.id, image_url, sort_order: 0 }]);
    }

    res.status(201).json(data);

  } catch (error) {
    console.error("ERROR CREATE:", error);
    res.status(500).json({ error: 'Error creando alojamiento' });
  }
});

// =========================
// 🖼️ OBTENER IMÁGENES DE UN ALOJAMIENTO (admin)
// =========================
router.get('/:id/images', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('accommodation_images')
      .select('id, image_url, sort_order')
      .eq('accommodation_id', id)
      .order('sort_order', { ascending: true });

    if (error) throw error;

    res.json(data);

  } catch (error) {
    console.error("ERROR GET IMAGES:", error);
    res.status(500).json({ error: 'Error obteniendo imágenes' });
  }
});

// =========================
// ➕ AGREGAR IMAGEN A UN ALOJAMIENTO (admin)
// =========================
router.post('/:id/images', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { image_url, sort_order = 0 } = req.body;

    if (!image_url)
      return res.status(400).json({ error: 'image_url es requerida' });

    // Verificar que el alojamiento le pertenece al usuario
    const { data: acc, error: accError } = await supabase
      .from('accommodations')
      .select('id')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();

    if (accError || !acc)
      return res.status(403).json({ error: 'No autorizado' });

    const { data, error } = await supabase
      .from('accommodation_images')
      .insert([{ accommodation_id: id, image_url, sort_order }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);

  } catch (error) {
    console.error("ERROR ADD IMAGE:", error);
    res.status(500).json({ error: 'Error agregando imagen' });
  }
});

// =========================
// 🗑️ ELIMINAR IMAGEN (admin)
// =========================
router.delete('/images/:imageId', verifyToken, async (req, res) => {
  try {
    const { imageId } = req.params;

    // Verificar que la imagen pertenece a un alojamiento del usuario
    const { data: img, error: checkError } = await supabase
      .from('accommodation_images')
      .select('id, accommodations!inner(user_id)')
      .eq('id', imageId)
      .single();

    if (checkError || !img)
      return res.status(404).json({ error: 'Imagen no encontrada' });

    if (img.accommodations.user_id !== req.user.id)
      return res.status(403).json({ error: 'No autorizado' });

    const { error } = await supabase
      .from('accommodation_images')
      .delete()
      .eq('id', imageId);

    if (error) throw error;

    res.json({ ok: true, message: 'Imagen eliminada' });

  } catch (error) {
    console.error("ERROR DELETE IMAGE:", error);
    res.status(500).json({ error: 'Error eliminando imagen' });
  }
});

module.exports = router;