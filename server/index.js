const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client/build')));

// Database setup
const db = new sqlite3.Database('./tickets.db', (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database');
    createTables();
  }
});

// Create tables
function createTables() {
  const createTicketsTable = `
    CREATE TABLE IF NOT EXISTS tickets (
      id TEXT PRIMARY KEY,
      buyer_name TEXT NOT NULL,
      buyer_email TEXT,
      event_name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      status TEXT DEFAULT 'Válido',
      qr_code TEXT UNIQUE
    )
  `;
  
  db.run(createTicketsTable, (err) => {
    if (err) {
      console.error('Error creating table:', err);
    } else {
      console.log('Tickets table ready');
    }
  });
}

// Routes

// Create new ticket
app.post('/api/tickets', async (req, res) => {
  try {
    const { buyer_name, buyer_email, event_name } = req.body;
    
    if (!buyer_name || !event_name) {
      return res.status(400).json({ error: 'Nombre del comprador y nombre del evento son requeridos' });
    }

    const ticketId = uuidv4();
    const qrCode = await QRCode.toDataURL(ticketId);
    
    const query = `
      INSERT INTO tickets (id, buyer_name, buyer_email, event_name, qr_code)
      VALUES (?, ?, ?, ?, ?)
    `;
    
    db.run(query, [ticketId, buyer_name, buyer_email, event_name, qrCode], function(err) {
      if (err) {
        console.error('Error creating ticket:', err);
        return res.status(500).json({ error: 'Error al crear el ticket' });
      }
      
      res.json({
        id: ticketId,
        buyer_name,
        buyer_email,
        event_name,
        created_at: moment().format('YYYY-MM-DD HH:mm:ss'),
        status: 'Válido',
        qr_code: qrCode
      });
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Get all tickets
app.get('/api/tickets', (req, res) => {
  const query = 'SELECT * FROM tickets ORDER BY created_at DESC';
  
  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('Error fetching tickets:', err);
      return res.status(500).json({ error: 'Error al obtener tickets' });
    }
    
    res.json(rows);
  });
});

// Get ticket by ID
app.get('/api/tickets/:id', (req, res) => {
  const { id } = req.params;
  
  const query = 'SELECT * FROM tickets WHERE id = ?';
  
  db.get(query, [id], (err, row) => {
    if (err) {
      console.error('Error fetching ticket:', err);
      return res.status(500).json({ error: 'Error al obtener ticket' });
    }
    
    if (!row) {
      return res.status(404).json({ error: 'Ticket no encontrado' });
    }
    
    res.json(row);
  });
});

// Validate ticket (check if exists and is valid)
app.post('/api/tickets/validate', (req, res) => {
  const { ticket_id } = req.body;
  
  if (!ticket_id) {
    return res.status(400).json({ error: 'ID del ticket es requerido' });
  }
  
  const query = 'SELECT * FROM tickets WHERE id = ?';
  
  db.get(query, [ticket_id], (err, row) => {
    if (err) {
      console.error('Error validating ticket:', err);
      return res.status(500).json({ error: 'Error al validar ticket' });
    }
    
    if (!row) {
      return res.json({
        valid: false,
        message: 'Ticket no encontrado'
      });
    }
    
    if (row.status === 'Canjeado') {
      return res.json({
        valid: false,
        already_redeemed: true,
        message: 'Ticket ya fue canjeado'
      });
    }
    
    res.json({
      valid: true,
      ticket: row,
      message: 'Ticket válido'
    });
  });
});

// Redeem ticket (mark as redeemed)
app.post('/api/tickets/redeem', (req, res) => {
  const { ticket_id } = req.body;
  
  if (!ticket_id) {
    return res.status(400).json({ error: 'ID del ticket es requerido' });
  }
  
  const query = 'UPDATE tickets SET status = ? WHERE id = ?';
  
  db.run(query, ['Canjeado', ticket_id], function(err) {
    if (err) {
      console.error('Error redeeming ticket:', err);
      return res.status(500).json({ error: 'Error al canjear ticket' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Ticket no encontrado' });
    }
    
    res.json({
      success: true,
      message: '🎉 ¡Ticket canjeado exitosamente! ¡Que disfrute el evento!'
    });
  });
});

// Delete ticket
app.delete('/api/tickets/:id', (req, res) => {
  const { id } = req.params;
  
  const query = 'DELETE FROM tickets WHERE id = ?';
  
  db.run(query, [id], function(err) {
    if (err) {
      console.error('Error deleting ticket:', err);
      return res.status(500).json({ error: 'Error al eliminar ticket' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Ticket no encontrado' });
    }
    
    res.json({
      success: true,
      message: 'Ticket eliminado exitosamente'
    });
  });
});

// Serve React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 