const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Database setup
const db = new sqlite3.Database('./properties.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database.');
    createTables();
  }
});

// Create tables
function createTables() {
  db.run(`
    CREATE TABLE IF NOT EXISTS properties (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      location TEXT NOT NULL,
      bedrooms INTEGER DEFAULT 0,
      bathrooms INTEGER DEFAULT 0,
      area REAL DEFAULT 0,
      images TEXT, -- JSON string
      type TEXT CHECK(type IN ('casa', 'apartamento', 'terreno')),
      status TEXT DEFAULT 'disponivel' CHECK(status IN ('disponivel', 'vendido', 'alugado')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Insert initial data if table is empty
  db.get("SELECT COUNT(*) as count FROM properties", (err, row) => {
    if (err) {
      console.error('Error checking table:', err.message);
    } else if (row.count === 0) {
      insertInitialData();
    }
  });
}

// Insert initial properties
function insertInitialData() {
  const initialProperties = [
    {
      title: 'Apartamento Luxuoso no Centro',
      description: 'Apartamento moderno com 3 quartos, 2 banheiros, vista para o mar.',
      price: 850000,
      location: 'Centro, São Paulo',
      bedrooms: 3,
      bathrooms: 2,
      area: 120,
      images: JSON.stringify(['/images/apartamento1.jpg']),
      type: 'apartamento',
      status: 'disponivel'
    },
    {
      title: 'Casa com Jardim',
      description: 'Casa espaçosa com jardim, 4 quartos, garagem para 2 carros.',
      price: 1200000,
      location: 'Jardins, São Paulo',
      bedrooms: 4,
      bathrooms: 3,
      area: 200,
      images: JSON.stringify(['/images/casa1.jpg']),
      type: 'casa',
      status: 'disponivel'
    },
    {
      title: 'Terreno para Construção',
      description: 'Terreno plano de 500m² em área nobre, pronto para construção.',
      price: 500000,
      location: 'Alphaville, Barueri',
      bedrooms: 0,
      bathrooms: 0,
      area: 500,
      images: JSON.stringify(['/images/terreno1.jpg']),
      type: 'terreno',
      status: 'disponivel'
    }
  ];

  const stmt = db.prepare(`
    INSERT INTO properties (title, description, price, location, bedrooms, bathrooms, area, images, type, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  initialProperties.forEach(property => {
    stmt.run(
      property.title,
      property.description,
      property.price,
      property.location,
      property.bedrooms,
      property.bathrooms,
      property.area,
      property.images,
      property.type,
      property.status
    );
  });

  stmt.finalize();
  console.log('Initial data inserted.');
}

// Routes

// GET /api/properties - Get all properties
app.get('/api/properties', (req, res) => {
  db.all("SELECT * FROM properties ORDER BY created_at DESC", (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    // Parse images JSON
    rows.forEach(row => {
      if (row.images) {
        row.images = JSON.parse(row.images);
      }
    });
    res.json(rows);
  });
});

// GET /api/properties/:id - Get property by ID
app.get('/api/properties/:id', (req, res) => {
  const { id } = req.params;
  db.get("SELECT * FROM properties WHERE id = ?", [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'Property not found' });
      return;
    }
    if (row.images) {
      row.images = JSON.parse(row.images);
    }
    res.json(row);
  });
});

// POST /api/properties - Create new property
app.post('/api/properties', (req, res) => {
  const { title, description, price, location, bedrooms, bathrooms, area, images, type, status } = req.body;

  if (!title || !price || !location || !type) {
    return res.status(400).json({ error: 'Title, price, location, and type are required' });
  }

  const imagesJson = JSON.stringify(images || []);

  db.run(`
    INSERT INTO properties (title, description, price, location, bedrooms, bathrooms, area, images, type, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [title, description, price, location, bedrooms || 0, bathrooms || 0, area || 0, imagesJson, type, status || 'disponivel'], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.status(201).json({ id: this.lastID });
  });
});

// PUT /api/properties/:id - Update property
app.put('/api/properties/:id', (req, res) => {
  const { id } = req.params;
  const { title, description, price, location, bedrooms, bathrooms, area, images, type, status } = req.body;

  const imagesJson = JSON.stringify(images || []);

  db.run(`
    UPDATE properties SET
      title = ?, description = ?, price = ?, location = ?, bedrooms = ?, bathrooms = ?,
      area = ?, images = ?, type = ?, status = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `, [title, description, price, location, bedrooms, bathrooms, area, imagesJson, type, status, id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: 'Property not found' });
      return;
    }
    res.json({ message: 'Property updated successfully' });
  });
});

// DELETE /api/properties/:id - Delete property
app.delete('/api/properties/:id', (req, res) => {
  const { id } = req.params;

  db.run("DELETE FROM properties WHERE id = ?", [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: 'Property not found' });
      return;
    }
    res.json({ message: 'Property deleted successfully' });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err.message);
    } else {
      console.log('Database connection closed.');
    }
    process.exit(0);
  });
});