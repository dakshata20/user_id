const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');

const app = express();
const port = 3000;


app.use(bodyParser.json());


const db = mysql.createConnection({
  host: 'mysql-container', 
  user: 'user', 
  password: 'letmein',
  database: 'userdb' 
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the MySQL database.');
});


app.post('/registerUser', (req, res) => {
  const { first_name, last_name, email, phone } = req.body;

  const sql = 'INSERT INTO users (first_name, last_name, email, phone) VALUES (?, ?, ?, ?)';
  db.query(sql, [first_name, last_name, email, phone], (err, result) => {
    if (err) {
      console.error('Error inserting user:', err);
      res.status(500).send('Error registering user');
      return;
    }
    res.status(201).send({ id: result.insertId, message: 'User registered successfully' });
  });
});


app.get('/getUserById/:id', (req, res) => {
  const userId = req.params.id;

  const sql = 'SELECT * FROM users WHERE id = ?';
  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error('Error fetching user:', err);
      res.status(500).send('Error fetching user details');
      return;
    }

    if (results.length === 0) {
      res.status(404).send('User not found');
      return;
    }

    res.send(results[0]);
  });
});


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
