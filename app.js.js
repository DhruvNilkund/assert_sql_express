const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const app = express();
app.use(bodyParser.json());

// MySQL connection setup
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'dhruvindia',
  database: 'mywebapi'
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error('Failed to connect to MySQL:', err);
    process.exit(1);
  }
  console.log('Connected to MySQL database');
});

// Login route
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Check if the username and password are valid
  db.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, results) => {
    if (err) {
      console.error('Failed to execute MySQL query:', err);
      res.status(500).json({ error: 'Internal server error' });
    } else if (results.length === 0) {
      res.status(401).json({ error: 'Invalid credentials' });
    } else {
      // Create and return a JSON web token for authorization
      const token = jwt.sign({ userId: results[0].id }, 'secret_key');
      res.json({ token });
    }
  });
});

// Register route
app.post('/register', (req, res) => {
  const { username, password } = req.body;

  // Insert a new user into the "users" table
  db.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, password], (err, results) => {
    if (err) {
      console.error('Failed to execute MySQL query:', err);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      res.json({ message: 'Registration successful' });
    }
  });
});

// Get all posts route
app.get('/posts', (req, res) => {
    // Query the "posts" table and join with "users" table to get the username
    db.query('SELECT posts.id, posts.title, posts.content, users.username AS username FROM posts INNER JOIN users ON posts.user_id = users.id', (err, results) => {
      if (err) {
        console.error('Failed to execute MySQL query:', err);
        res.status(500).json({ error: 'Internal server error' });
      } else {
        res.json(results);
      }
    });
  });
  
  // Get posts by user ID route
  app.get('/posts/:userId', (req, res) => {
    const userId = req.params.userId;
  
    // Query the "posts" table and join with "users" table to get the username
    db.query('SELECT posts.id, posts.title, posts.content, users.username AS username FROM posts INNER JOIN users ON posts.user_id = users.id WHERE posts.user_id = ?', [userId], (err, results) => {
      if (err) {
        console.error('Failed to execute MySQL query:', err);
        res.status(500).json({ error: 'Internal server error' });
      } else {
        res.json(results);
      }
    });
  });
  
  // Create a new post route
  app.post('/posts/new', (req, res) => {
    const { title, content, userId } = req.body;
  
    // Validate the user's post information
    if (!title || !content || !userId) {
      res.status(400).json({ error: 'Invalid post information' });
      return;
    }
  
    // Insert a new post into the "posts" table
    db.query('INSERT INTO posts (title, content, user_id) VALUES (?, ?, ?)', [title, content, userId], (err, results) => {
      if (err) {
        console.error('Failed to execute MySQL query:', err);
        res.status(500).json({ error: 'Internal server error' });
      } else {
        res.json({ message: 'Post created successfully' });
      }
    });
  });
  
  // Start the server
  app.listen(3000, () => {
    console.log('Server is listening on port 3000');
  });
  