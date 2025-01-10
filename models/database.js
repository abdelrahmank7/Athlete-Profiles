const sqlite3 = require("sqlite3").verbose();
const fs = require("fs");
const path = require("path");

// Ensure the directory exists
const dataDir = path.join(__dirname, "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

// Create and connect to the SQLite database
const dbPath = path.join(dataDir, "database.db");
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Error opening database:", err.message);
  } else {
    console.log("Connected to the SQLite database.");
  }
});

// Function to create tables
const createTables = () => {
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

// Initialize the tables if they don't exist
db.serialize(createTables);

module.exports = db;
