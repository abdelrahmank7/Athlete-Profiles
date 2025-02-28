import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { athletesDb } from "../models/database.js"; // Assuming this uses better-sqlite3
import Database from "better-sqlite3";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure the data directory exists
const dataDir = path.join(__dirname, "../models/data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Export athlete data as a SQLite database file
router.post("/:athleteId", async (req, res) => {
  const athleteId = req.params.athleteId;

  try {
    console.log(`Attempting to export data for athlete ID: ${athleteId}`);

    // Fetch athlete name from the database
    const query = `SELECT name FROM athletes WHERE id = ?`;
    const stmt = athletesDb.prepare(query);
    const row = stmt.get([athleteId]);
    if (!row) {
      console.warn(`Athlete with ID ${athleteId} not found.`);
      return res.status(404).json({ error: "Athlete not found" });
    }

    const athleteName = row.name;
    console.log(`Found athlete: ${athleteName} (${athleteId})`);

    // Define the output file path
    const folderName = `${athleteName} (${athleteId})`;
    const exportDir = path.join(__dirname, "../models/data", folderName);

    console.log(`Creating directory: ${exportDir}`);
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }

    const exportFilePath = path.join(
      exportDir,
      `${athleteName} (${athleteId}).db`
    );
    console.log(`Exporting data to file: ${exportFilePath}`);

    // Create a new SQLite database file using better-sqlite3
    const exportDb = new Database(exportFilePath);

    // List of tables to include in the export
    const tables = [
      "athletes",
      "notes",
      "supplements",
      "tournaments",
      "appointments",
      "history",
      "customTable",
      "files",
    ];

    for (const table of tables) {
      console.log(`Processing table: ${table}`);

      let selectQuery;
      if (table === "athletes") {
        // Special case for the 'athletes' table (use 'id' instead of 'athleteId')
        selectQuery = `SELECT * FROM athletes WHERE id = ?`;
      } else {
        // Use 'athleteId' for all other tables
        selectQuery = `SELECT * FROM ${table} WHERE athleteId = ?`;
      }

      const rows = athletesDb.prepare(selectQuery).all([athleteId]);

      if (rows.length > 0) {
        console.log(`Creating table: ${table}`);
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS ${table} (
              ${getTableSchema(table)}
            );
          `;
        exportDb.exec(createTableQuery);

        console.log(`Inserting data into table: ${table}`);
        const insertQuery = getInsertQuery(table);
        const insertStmt = exportDb.prepare(insertQuery);

        for (const row of rows) {
          const values = Object.values(row); // Extract values from the row object

          // Skip duplicate inserts for the 'athletes' table
          if (table === "athletes") {
            const checkQuery = `SELECT COUNT(*) AS count FROM athletes WHERE id = ?`;
            const checkStmt = exportDb.prepare(checkQuery);
            const result = checkStmt.get([values[0]]); // Check if the athlete already exists
            if (result.count > 0) {
              console.log(
                `Skipping duplicate insert for athlete: ${values[0]}`
              );
              continue; // Skip insertion if the athlete already exists
            }
          }

          // Insert the record
          insertStmt.run(values);
        }
      } else {
        console.log(`No data found for table: ${table}`);
      }
    }

    console.log("Closing the database connection...");
    exportDb.close();

    console.log("Data exported successfully.");
    res.json({
      message: "Data exported successfully",
      filePath: exportFilePath,
    });
  } catch (err) {
    console.error("Error exporting athlete data:", err.message);
    res.status(500).json({ error: "Failed to export athlete data" });
  }
});

// Helper function to generate table schema based on table name
const getTableSchema = (tableName) => {
  switch (tableName) {
    case "athletes":
      return `
          id TEXT PRIMARY KEY,
          name TEXT,
          birthdate TEXT,
          weight REAL,
          targetWeight REAL,
          height REAL,
          club TEXT,
          sport TEXT,
          currentWeight REAL,
          fatsPercentage REAL,
          musclePercentage REAL
        `;
    case "notes":
      return `
          id TEXT PRIMARY KEY,
          athleteId TEXT,
          note TEXT,
          date TEXT
        `;
    case "supplements":
      return `
          id TEXT PRIMARY KEY,
          athleteId TEXT,
          supplement TEXT,
          date TEXT
        `;
    case "tournaments":
      return `
          id TEXT PRIMARY KEY,
          athleteId TEXT,
          date TEXT,
          tournamentName TEXT
        `;
    case "appointments":
      return `
          id TEXT PRIMARY KEY,
          athleteId TEXT,
          date TEXT,
          tournamentName TEXT
        `;
    case "history":
      return `
          id TEXT PRIMARY KEY,
          athleteId TEXT,
          date TEXT,
          weight TEXT,
          fats TEXT,
          muscle TEXT
        `;
    case "customTable":
      return `
          athleteId TEXT PRIMARY KEY,
          tableHead TEXT,
          tableRows TEXT
        `;
    case "files":
      return `
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          athleteId TEXT,
          name TEXT,
          path TEXT,
          uploadDate TEXT
        `;
    default:
      return "";
  }
};

// Helper function to generate INSERT query based on table name
const getInsertQuery = (tableName) => {
  switch (tableName) {
    case "athletes":
      return `INSERT INTO athletes (id, name, birthdate, weight, targetWeight, height, club, sport, currentWeight, fatsPercentage, musclePercentage) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    case "notes":
      return `INSERT INTO notes (id, athleteId, note, date) VALUES (?, ?, ?, ?)`;
    case "supplements":
      return `INSERT INTO supplements (id, athleteId, supplement, date) VALUES (?, ?, ?, ?)`;
    case "tournaments":
      return `INSERT INTO tournaments (id, athleteId, date, tournamentName) VALUES (?, ?, ?, ?)`;
    case "appointments":
      return `INSERT INTO appointments (id, athleteId, date, tournamentName) VALUES (?, ?, ?, ?)`;
    case "history":
      return `INSERT INTO history (id, athleteId, date, weight, fats, muscle) VALUES (?, ?, ?, ?, ?, ?)`;
    case "customTable":
      return `INSERT INTO customTable (athleteId, tableHead, tableRows) VALUES (?, ?, ?)`;
    case "files":
      return `INSERT INTO files (id, athleteId, name, path, uploadDate) VALUES (?, ?, ?, ?, ?)`;
    default:
      return "";
  }
};

export default router;
