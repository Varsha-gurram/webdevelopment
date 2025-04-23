const express = require('express');
const mysql = require('mysql2');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const searchRoute = require('./routes/search');
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use('/api/auth', authRoutes);
app.use('/search', searchRoute);
app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '@GVDsvr1*',
  database: 'ecommerce',
});

db.connect((err) => {
  if (err) {
    console.error('❌ MySQL connection error:', err);
    return;
  }
  console.log('✅ MySQL connected');
});
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => console.error('❌ MongoDB connection error:', err));
app.get('/api/products', (req, res) => {
  db.query('SELECT * FROM products', (err, results) => {
    if (err) return res.status(500).json({ message: 'Error fetching products' });
    res.json(results);
  });
});
app.get('/api/products/category/:category', (req, res) => {
  let category = decodeURIComponent(req.params.category).replace(/-/g, ' ');
  db.query('SELECT * FROM products WHERE category = ?', [category], (err, results) => {
    if (err) return res.status(500).json({ message: 'Error fetching category products' });
    res.json(results);
  });
});
app.get('/api/products/:id', (req, res) => {
  const productId = req.params.id;
  const query = 'SELECT * FROM products WHERE id = ?';

  db.query(query, [productId], (err, results) => {
    if (err) {
      console.error('❌ Error fetching product:', err);
      return res.status(500).json({ message: 'Error fetching product' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(results[0]);
  });
});
app.post('/api/products/add', (req, res) => {
  const { title, price, category, image } = req.body;
  const query = 'INSERT INTO products (title, price, category, image) VALUES (?, ?, ?, ?)';
  db.query(query, [title, price, category, image], (err, results) => {
    if (err) {
      console.error('❌ Error adding product:', err);
      return res.status(500).json({ message: 'Error adding product' });
    }
    res.status(201).json({ message: 'Product added successfully' });
  });
});
app.delete('/api/products/:id', (req, res) => {
  const productId = req.params.id;
  const sql = 'DELETE FROM products WHERE id = ?';

  db.query(sql, [productId], (err, result) => {
    if (err) {
      console.error('❌ Error deleting product:', err);
      return res.status(500).send('Server error');
    }

    if (result.affectedRows === 0) {
      return res.status(404).send('Product not found');
    }

    res.status(200).send('Product deleted successfully');
  });
});
app.put('/api/products/:id', (req, res) => {
  const productId = req.params.id;
  const { title, price, category, image } = req.body;

  const query = 'UPDATE products SET title = ?, price = ?, category = ?, image = ? WHERE id = ?';
  db.query(query, [title, price, category, image, productId], (err, result) => {
    if (err) {
      console.error('❌ Error updating product:', err);
      return res.status(500).json({ message: 'Error updating product' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({ message: 'Product updated successfully' });
  });
});
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: {
    type: String,
    default: 'user'
  }
});

const User = mongoose.models.User || mongoose.model('User', userSchema);
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    console.error('❌ Error fetching users:', err);
    res.status(500).json({ message: 'Error fetching users' });
  }
});
