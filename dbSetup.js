const sqlite3 = require('sqlite3').verbose();

// Connect to SQLite3 database
const db = new sqlite3.Database('./database/studybuddy.db', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the SQLite database.');
});

// Define the schema for the app
db.serialize(() => {
    // Create Users table with email and password fields
    db.run(`
      CREATE TABLE IF NOT EXISTS Users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        major TEXT NOT NULL,
        year TEXT,
        study_preferences TEXT
      )
    `);

    // Create Courses table
    db.run(`
      CREATE TABLE IF NOT EXISTS Courses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        course_name TEXT NOT NULL,
        department TEXT
      )
    `);

    // Create StudySessions table
    db.run(`
      CREATE TABLE IF NOT EXISTS StudySessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        course_id INTEGER,
        user_id INTEGER,
        date TEXT,
        time TEXT,
        FOREIGN KEY (course_id) REFERENCES Courses(id),
        FOREIGN KEY (user_id) REFERENCES Users(id)
      )
    `);

    // Create Messages table
    db.run(`
      CREATE TABLE IF NOT EXISTS Messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id INTEGER,
        sender_id INTEGER,
        message TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (session_id) REFERENCES StudySessions(id),
        FOREIGN KEY (sender_id) REFERENCES Users(id)
      )
    `);
});

// Close the database connection
db.close((err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Closed the database connection.');
});
