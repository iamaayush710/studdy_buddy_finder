const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;
const SECRET_KEY = "your_secret_key"; // Replace with a secure key

// Middleware to parse JSON requests
app.use(bodyParser.json());

// Connect to the SQLite3 database
const db = new sqlite3.Database('./database/studybuddy.db', (err) => {
  if (err) {
    console.error('Could not connect to database', err);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

/* ----------------- CRUD OPERATIONS FOR USERS ----------------- */

// Create a new user (CRUD: Create)
app.post('/users', (req, res) => {
  const { name, major, year, study_preferences } = req.body;
  const query = `INSERT INTO Users (name, major, year, study_preferences) VALUES (?, ?, ?, ?)`;
  db.run(query, [name, major, year, study_preferences], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ id: this.lastID, name, major, year, study_preferences });
  });
});

// Get all users (CRUD: Read)
app.get('/users', (req, res) => {
  const query = `SELECT * FROM Users`;
  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Get a user by ID (CRUD: Read)
app.get('/users/:id', (req, res) => {
  const { id } = req.params;
  const query = `SELECT * FROM Users WHERE id = ?`;
  db.get(query, [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(row);
  });
});

// Update a user by ID (CRUD: Update)
app.put('/users/:id', (req, res) => {
  const { id } = req.params;
  const { name, major, year, study_preferences } = req.body;
  const query = `UPDATE Users SET name = ?, major = ?, year = ?, study_preferences = ? WHERE id = ?`;
  db.run(query, [name, major, year, study_preferences, id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: `User updated successfully.` });
  });
});

// Delete a user by ID (CRUD: Delete)
app.delete('/users/:id', (req, res) => {
  const { id } = req.params;
  const query = `DELETE FROM Users WHERE id = ?`;
  db.run(query, [id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: `User deleted successfully.` });
  });
});

/* ----------------- AUTHENTICATION SYSTEM ----------------- */

// Register a new user
app.post('/register', async (req, res) => {
  const { name, email, password, major, year, study_preferences } = req.body;
  
  try {
    // Check if user already exists
    const userExists = await new Promise((resolve, reject) => {
      db.get("SELECT * FROM Users WHERE email = ?", [email], (err, row) => {
        if (err) reject(err);
        resolve(row);
      });
    });
    
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insert the new user
    const query = `INSERT INTO Users (name, email, password, major, year, study_preferences) VALUES (?, ?, ?, ?, ?, ?)`;
    db.run(query, [name, email, hashedPassword, major, year, study_preferences], function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ id: this.lastID, name, email, major, year, study_preferences });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login route
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  db.get("SELECT * FROM Users WHERE email = ?", [email], async (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(400).json({ message: "User not found" });

    // Compare hashed passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(400).json({ message: "Invalid password" });

    // Generate a JWT token
    const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: "1h" });
    res.json({ message: "Login successful", token });
  });
});

// Middleware to protect routes
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: "Access Denied" });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid Token" });
    req.user = user; // Attach user information to request
    next();
  });
}

// Protected route example
app.get('/protected', authenticateToken, (req, res) => {
  res.json({ message: `Welcome, ${req.user.email}! You have access to this resource.` });
});

/* ----------------- START THE SERVER ----------------- */

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
