require('dotenv').config();
const mysql = require('mysql2');

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,  
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  port: process.env.MYSQL_PORT,
  waitForConnections: true,
  connectionLimit: 10,    
  queueLimit: 0           
});

const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

app.use(bodyParser.json());

pool.query(`CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE
)`, (err) => {
  if (err) throw err;
  console.log('User table created or already exists');
});

app.post('/registerUser', (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).send('Name and email are required');
  }

  const query = 'INSERT INTO users (name, email) VALUES (?, ?)';
  pool.query(query, [name, email], (err, result) => {
    if (err) {
      console.error('Error inserting user:', err);
      return res.status(500).send('Error registering user');
    }
    res.status(201).send({ id: result.insertId, name, email });
  });
});

app.get('/getUserById/:id', (req, res) => {
  const { id } = req.params;

  const query = 'SELECT * FROM users WHERE id = ?';
  pool.query(query, [id], (err, results) => {
    if (err) {
      console.error('Error fetching user:', err);
      return res.status(500).send('Error fetching user');
    }
    if (results.length === 0) {
      return res.status(404).send('User not found');
    }
    res.send(results[0]);
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
