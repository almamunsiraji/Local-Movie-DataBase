const express = require("express");
const cors = require("cors");
require("dotenv").config();
const db = require("./db");

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Parse JSON request bodies

// ---------- ROUTES ----------

// Root route
app.get("/", (req, res) => {
  res.send("🎬 Movie Info API is running...");
});

// -------------------- DIRECTOR ROUTES --------------------

// GET all directors
app.get("/directors", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM Director");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET director by ID
app.get("/directors/:id", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM Director WHERE Person_ID = ?",
      [req.params.id],
    );
    if (rows.length === 0)
      return res.status(404).json({ message: "Director not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new director
app.post("/directors", async (req, res) => {
  const { Person_ID, Director_Name, Birth_Year, No_Of_Films, No_Of_Awards } =
    req.body;
  try {
    await db.query(
      "INSERT INTO Director (Person_ID, Director_Name, Birth_Year, No_Of_Films, No_Of_Awards) VALUES (?, ?, ?, ?, ?)",
      [Person_ID, Director_Name, Birth_Year, No_Of_Films, No_Of_Awards],
    );
    res.status(201).json({ message: "Director added successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------- ACTOR ROUTES --------------------

app.get("/actors", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM Actor");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/actors", async (req, res) => {
  const { Person_ID, Actor_Name, Birth_Year, No_Of_Films, No_Of_Awards } =
    req.body;
  try {
    await db.query(
      "INSERT INTO Actor (Person_ID, Actor_Name, Birth_Year, No_Of_Films, No_Of_Awards) VALUES (?, ?, ?, ?, ?)",
      [Person_ID, Actor_Name, Birth_Year, No_Of_Films, No_Of_Awards],
    );
    res.status(201).json({ message: "Actor added successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------- MOVIE ROUTES --------------------

// GET all movies with director name (JOIN example)
app.get("/movies", async (req, res) => {
  try {
    const [rows] = await db.query(`
            SELECT m.Movie_ID, m.Movie_Name, m.Genre, m.Year, m.IMDb_Rating,
                   d.Director_Name
            FROM Movie m
            LEFT JOIN Director d ON m.Director_ID = d.Person_ID
        `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single movie by ID
app.get("/movies/:id", async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT m.*, d.Director_Name
             FROM Movie m
             LEFT JOIN Director d ON m.Director_ID = d.Person_ID
             WHERE m.Movie_ID = ?`,
      [req.params.id],
    );
    if (rows.length === 0)
      return res.status(404).json({ message: "Movie not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new movie
app.post("/movies", async (req, res) => {
  const { Movie_ID, Movie_Name, Genre, Year, IMDb_Rating, Director_ID } =
    req.body;
  try {
    await db.query(
      "INSERT INTO Movie (Movie_ID, Movie_Name, Genre, Year, IMDb_Rating, Director_ID) VALUES (?, ?, ?, ?, ?, ?)",
      [Movie_ID, Movie_Name, Genre, Year, IMDb_Rating, Director_ID],
    );
    res.status(201).json({ message: "Movie added successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------- CHARACTER ROUTES --------------------

// Get characters for a specific movie
app.get("/movies/:id/characters", async (req, res) => {
  try {
    const [rows] = await db.query(
      `
            SELECT c.Character_ID, c.Character_Name, c.Age
            FROM Movie_Characters c
            JOIN Movie_Character_Relationship r ON c.Character_ID = r.Character_ID
            WHERE r.Movie_ID = ?
        `,
      [req.params.id],
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------- START SERVER --------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
