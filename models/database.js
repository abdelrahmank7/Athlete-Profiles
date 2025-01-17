import sqlite3 from "sqlite3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Ensure the directory exists
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

// Create and connect to the SQLite database for athletes
const dbPath = path.join(dataDir, "database.db");
const athletesDb = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Error opening athletes database:", err.message);
  } else {
    console.log("Connected to the SQLite database.");
  }
});

// Create and connect to the SQLite database for clubs and sports
const clubsAndSportsDbPath = path.join(dataDir, "clubsAndSports.db");
const clubsAndSportsDb = new sqlite3.Database(clubsAndSportsDbPath, (err) => {
  if (err) {
    console.error("Error opening clubsAndSports database:", err.message);
  } else {
    console.log("Connected to the SQLite clubsAndSports database.");
  }
});

// Function to create tables
const createTables = (db) => {
  const tables = [
    {
      name: "athletes",
      schema: `
        id TEXT PRIMARY KEY,
        name TEXT,
        birthdate TEXT,
        weight INTEGER,
        targetWeight INTEGER,
        height INTEGER,
        club TEXT,
        sport TEXT,
        currentWeight INTEGER,
        fatsPercentage INTEGER,
        musclePercentage INTEGER
      `,
    },
    {
      name: "notes",
      schema: `
        id TEXT PRIMARY KEY,
        athleteId TEXT,
        note TEXT,
        date TEXT,
        FOREIGN KEY (athleteId) REFERENCES athletes(id)
      `,
    },
    {
      name: "supplements",
      schema: `
        id TEXT PRIMARY KEY,
        athleteId TEXT,
        note TEXT,
        date TEXT,
        FOREIGN KEY (athleteId) REFERENCES athletes(id)
      `,
    },
    {
      name: "appointments",
      schema: `
        id TEXT PRIMARY KEY,
        athleteId TEXT,
        date TEXT,
        tournamentName TEXT,
        FOREIGN KEY (athleteId) REFERENCES athletes(id)
      `,
    },
    {
      name: "history",
      schema: `
        id TEXT PRIMARY KEY,
        athleteId TEXT,
        date TEXT,
        weight INTEGER,
        fats INTEGER,
        muscle INTEGER,
        FOREIGN KEY (athleteId) REFERENCES athletes(id)
      `,
    },
    {
      name: "customTables",
      schema: `
        athleteId TEXT,
        tableData TEXT,
        FOREIGN KEY (athleteId) REFERENCES athletes(id)
      `,
    },
    {
      name: "clubs",
      schema: `
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE
      `,
    },
    {
      name: "sports",
      schema: `
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE
      `,
    },
  ];

  tables.forEach((table) => {
    const query = `CREATE TABLE IF NOT EXISTS ${table.name} (${table.schema})`;
    db.run(query, (err) => {
      if (err) {
        console.error(`Error creating table ${table.name}:`, err.message);
      }
    });
  });
};

// Initialize the tables if they don't exist in both databases
athletesDb.serialize(() => createTables(athletesDb));
clubsAndSportsDb.serialize(() => createTables(clubsAndSportsDb));

export { athletesDb, clubsAndSportsDb };
