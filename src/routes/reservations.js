/*const router = require('express').Router();
const db = require('../config/db');

// =========================
// ➕ CREAR RESERVA
// =========================
router.post('/', async (req, res) => {
  try {
    const { accommodation_id, user_name, user_contact, date_from, date_to } = req.body;

    if (!accommodation_id || !user_name || !date_from || !date_to) {
      return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }

    // ✅ Verificar solapamiento de fechas antes de insertar
    const overlap = await db.query(
      `SELECT id FROM reservations
       WHERE accommodation_id = $1
         AND status != 'cancelada'
         AND date_from < $3
         AND date_to   > $2`,
      [accommodation_id, date_from, date_to]
    );

    if (overlap.rows.length > 0) {
      return res.status(400).json({ error: 'Fechas no disponibles para ese alojamiento' });
    }

    const result = await db.query(
      `INSERT INTO reservations
         (accommodation_id, user_name, user_contact, date_from, date_to, status)
       VALUES ($1, $2, $3, $4, $5, 'pendiente')
       RETURNING *`,
      [accommodation_id, user_name, user_contact, date_from, date_to]
    );

    res.status(201).json({
      message: 'Reserva creada',
      reservation: result.rows[0]
    });

  } catch (error) {
    console.error("ERROR CREAR RESERVA:", error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// =========================
// 📅 FECHAS OCUPADAS POR ALOJAMIENTO
// =========================
router.get('/availability/:id', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT date_from, date_to
       FROM reservations
       WHERE accommodation_id = $1
         AND status != 'cancelada'`,
      [req.params.id]
    );

    res.json(result.rows);

  } catch (err) {
    console.error("ERROR AVAILABILITY:", err);
    res.status(500).json({ error: 'Error obteniendo disponibilidad' });
  }
});

// =========================
// 📊 RESERVAS DEL DUEÑO
// =========================
router.get('/owner/:userId', async (req, res) => {
  try {
    // ✅ Paginación opcional: ?page=1&limit=20
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 20);
    const offset = (page - 1) * limit;

    // ✅ Filtro opcional por estado: ?status=pendiente
    const { status } = req.query;
    const statusFilter = status ? `AND r.status = $3` : '';
    const params = status
      ? [req.params.userId, limit, status, offset]
      : [req.params.userId, limit, offset];

    const result = await db.query(`
      SELECT
        r.*,
        a.name AS accommodation_name
      FROM reservations r
      JOIN accommodations a ON r.accommodation_id = a.id
      WHERE a.user_id = $1
        ${statusFilter}
      ORDER BY
        CASE r.status WHEN 'pendiente' THEN 0 ELSE 1 END,
        r.date_from ASC
      LIMIT $2
      OFFSET ${status ? '$4' : '$3'}
    `, params);

    // ✅ Total para paginación en el frontend
    const countResult = await db.query(`
      SELECT COUNT(*) FROM reservations r
      JOIN accommodations a ON r.accommodation_id = a.id
      WHERE a.user_id = $1
        ${status ? 'AND r.status = $2' : ''}
    `, status ? [req.params.userId, status] : [req.params.userId]);

    res.json({
      data: result.rows,
      total: parseInt(countResult.rows[0].count),
      page,
      limit,
    });

  } catch (error) {
    console.error("ERROR OWNER:", error);
    res.status(500).json({ error: 'Error obteniendo reservas' });
  }
});

// =========================
// 🔄 CAMBIAR ESTADO — necesario para el admin
// =========================
const VALID_STATUSES = ['pendiente', 'confirmada', 'cancelada', 'completada'];

router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        error: `Estado inválido. Permitidos: ${VALID_STATUSES.join(', ')}`
      });
    }

    // ✅ Validar transiciones lógicas
    const current = await db.query(
      `SELECT status FROM reservations WHERE id = $1`, [id]
    );

    if (current.rows.length === 0) {
      return res.status(404).json({ error: 'Reserva no encontrada' });
    }

    const currentStatus = current.rows[0].status;
    const forbidden = currentStatus === 'completada' || currentStatus === 'cancelada';

    if (forbidden) {
      return res.status(400).json({
        error: `No se puede cambiar una reserva ${currentStatus}`
      });
    }

    const result = await db.query(
      `UPDATE reservations
       SET status = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [status, id]
    );

    res.json({
      message: 'Estado actualizado',
      reservation: result.rows[0]
    });

  } catch (error) {
    console.error("ERROR PATCH STATUS:", error);
    res.status(500).json({ error: 'Error actualizando estado' });
  }
});

// =========================
// 🗑️ ELIMINAR RESERVA
// =========================
router.delete('/:id', async (req, res) => {
  try {
    const result = await db.query(
      `DELETE FROM reservations WHERE id = $1 RETURNING id`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Reserva no encontrada' });
    }

    res.json({ message: 'Reserva eliminada', id: req.params.id });

  } catch (error) {
    console.error("ERROR DELETE:", error);
    res.status(500).json({ error: 'Error eliminando reserva' });
  }
});

module.exports = router;*/




/*para que vuelva correr online debo de quital los documentadores y documentar lo que esta arriba */
const router = require('express').Router();
const supabase = require('../config/db');

// =========================
// ➕ CREAR RESERVA
// =========================
router.post('/', async (req, res) => {
  try {
    const { accommodation_id, user_name, user_contact, date_from, date_to } = req.body;

    if (!accommodation_id || !user_name || !date_from || !date_to)
      return res.status(400).json({ error: 'Faltan datos obligatorios' });

    // ✅ Verificar solapamiento de fechas
    const { data: overlap } = await supabase
      .from('reservations')
      .select('id')
      .eq('accommodation_id', accommodation_id)
      .neq('status', 'cancelada')
      .lt('date_from', date_to)
      .gt('date_to', date_from);

    if (overlap && overlap.length > 0)
      return res.status(400).json({ error: 'Fechas no disponibles para ese alojamiento' });

    const { data, error } = await supabase
      .from('reservations')
      .insert([{ accommodation_id, user_name, user_contact, date_from, date_to, status: 'pendiente' }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ message: 'Reserva creada', reservation: data });

  } catch (error) {
    console.error("ERROR CREAR RESERVA:", error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// =========================
// 📅 FECHAS OCUPADAS POR ALOJAMIENTO
// =========================
router.get('/availability/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('reservations')
      .select('date_from, date_to')
      .eq('accommodation_id', req.params.id)
      .neq('status', 'cancelada');

    if (error) throw error;

    res.json(data);

  } catch (err) {
    console.error("ERROR AVAILABILITY:", err);
    res.status(500).json({ error: 'Error obteniendo disponibilidad' });
  }
});

// =========================
// 📊 RESERVAS DEL DUEÑO
// =========================
router.get('/owner/:userId', async (req, res) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 20);
    const offset = (page - 1) * limit;
    const { status } = req.query;

    // Obtener IDs de alojamientos del dueño
    const { data: accommodations, error: accError } = await supabase
      .from('accommodations')
      .select('id')
      .eq('user_id', req.params.userId);

    if (accError) throw accError;

    const accommodationIds = accommodations.map(a => a.id);

    if (accommodationIds.length === 0)
      return res.json({ data: [], total: 0, page, limit });

    // Query de reservas con filtro opcional de status
    let query = supabase
      .from('reservations')
      .select('*, accommodations(name)', { count: 'exact' })
      .in('accommodation_id', accommodationIds)
      .order('date_from', { ascending: true })
      .range(offset, offset + limit - 1);

    if (status) query = query.eq('status', status);

    const { data, error, count } = await query;

    if (error) throw error;

    // Formatear para mantener accommodation_name igual que antes
    const formatted = data.map(r => ({
      ...r,
      accommodation_name: r.accommodations?.name,
      accommodations: undefined
    }));

    res.json({ data: formatted, total: count, page, limit });

  } catch (error) {
    console.error("ERROR OWNER:", error);
    res.status(500).json({ error: 'Error obteniendo reservas' });
  }
});

// =========================
// 🔄 CAMBIAR ESTADO
// =========================
const VALID_STATUSES = ['pendiente', 'confirmada', 'cancelada', 'completada'];

router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    if (!VALID_STATUSES.includes(status))
      return res.status(400).json({ error: `Estado inválido. Permitidos: ${VALID_STATUSES.join(', ')}` });

    // Verificar estado actual
    const { data: current, error: fetchError } = await supabase
      .from('reservations')
      .select('status')
      .eq('id', id)
      .single();

    if (fetchError || !current)
      return res.status(404).json({ error: 'Reserva no encontrada' });

    if (current.status === 'completada' || current.status === 'cancelada')
      return res.status(400).json({ error: `No se puede cambiar una reserva ${current.status}` });

    const { data, error } = await supabase
      .from('reservations')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({ message: 'Estado actualizado', reservation: data });

  } catch (error) {
    console.error("ERROR PATCH STATUS:", error);
    res.status(500).json({ error: 'Error actualizando estado' });
  }
});

// =========================
// 🗑️ ELIMINAR RESERVA
// =========================
router.delete('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('reservations')
      .delete()
      .eq('id', req.params.id)
      .select('id')
      .single();

    if (error || !data)
      return res.status(404).json({ error: 'Reserva no encontrada' });

    res.json({ message: 'Reserva eliminada', id: req.params.id });

  } catch (error) {
    console.error("ERROR DELETE:", error);
    res.status(500).json({ error: 'Error eliminando reserva' });
  }
});

module.exports = router;