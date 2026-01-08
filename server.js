// include the required packages
const express = require('express');
const mysql = require('mysql2/promise');
require('dotenv').config();
const port = 3000;

// database config info
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 100,
  queueLimit: 0,
};

// initialize Express app
const app = express();
// helps app to read JSON
app.use(express.json());

// start the server
app.listen(port, () => {
  console.log('Server running on port', port);
});

// Get all albums
app.get('/albums', async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute('SELECT * FROM kpop_albums');
    await connection.end();
    res.json(rows);
  } catch (err) {
    console.error('GET ALBUMS ERROR:', err);
    res.status(500).json({ message: 'Server error for /albums' });
  }
});

// Add a new album
app.post('/albums', async (req, res) => {
  const { album_name, album_pic } = req.body;

  if (!album_name || !album_pic) {
    return res
      .status(400)
      .json({ message: 'album_name and album_pic are required' });
  }

  try {
    const connection = await mysql.createConnection(dbConfig);
    await connection.execute(
      'INSERT INTO kpop_albums (album_name, album_pic) VALUES (?, ?)',
      [album_name, album_pic]
    );
    await connection.end();

    res
      .status(201)
      .json({ message: 'Album ' + album_name + ' added successfully' });
  } catch (err) {
    console.error('ADD ALBUM ERROR:', err);
    res
      .status(500)
      .json({ message: 'Server error - could not add album ' + album_name });
  }
});

// Update an album by id
app.put('/albums/:id', async (req, res) => {
  const albumId = req.params.id;
  const { album_name, album_pic } = req.body;

  if (!album_name || !album_pic) {
    return res
      .status(400)
      .json({ message: 'album_name and album_pic are required' });
  }

  try {
    const connection = await mysql.createConnection(dbConfig);
    const [result] = await connection.execute(
      'UPDATE kpop_albums SET album_name = ?, album_pic = ? WHERE id = ?',
      [album_name, album_pic, albumId]
    );
    await connection.end();

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Album not found' });
    }

    res.json({ message: 'Album ' + albumId + ' updated successfully' });
  } catch (err) {
    console.error('UPDATE ALBUM ERROR:', err);
    res
      .status(500)
      .json({ message: 'Server error - could not update album ' + albumId });
  }
});

// Delete an album by id
app.delete('/albums/:id', async (req, res) => {
  const albumId = req.params.id;

  try {
    const connection = await mysql.createConnection(dbConfig);
    const [result] = await connection.execute(
      'DELETE FROM kpop_albums WHERE id = ?',
      [albumId]
    );
    await connection.end();

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Album not found' });
    }

    res.json({ message: 'Album ' + albumId + ' deleted successfully' });
  } catch (err) {
    console.error('DELETE ALBUM ERROR:', err);
    res
      .status(500)
      .json({ message: 'Server error - could not delete album ' + albumId });
  }
});