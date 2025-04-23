const express = require('express');
const mysql = require('mysql2');
const router = express.Router();

// Create MySQL connection pool
const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '@GVDsvr1*',
  database: 'ecommerce'
});

// Route to handle searching products
router.get('/', (req, res) => {
  const searchTerm = req.query.q;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  // Validation for search term
  if (!searchTerm || searchTerm.trim() === '' || searchTerm.length > 100) {
    return res.status(400).json({ error: 'Invalid search term' });
  }

  const likeTerm = `%${searchTerm.trim()}%`;

  const query = `
    SELECT id, title, price, category, image 
    FROM products 
    WHERE LOWER(title) LIKE LOWER(?) OR LOWER(category) LIKE LOWER(?)
    LIMIT ? OFFSET ?
  `;

  db.query(query, [likeTerm, likeTerm, limit, offset], (err, results) => {
    if (err) {
      console.error('Database search error:', err);
      return res.status(500).json({ success: false, error: 'Database error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ success: false, message: 'No products found' });
    }

    // Return search results
    res.json({ success: true, data: results });
  });
});

module.exports = router;
