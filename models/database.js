import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure the directory exists
const dataDir = path.join(__dirname, "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Correct database paths
const dbPath = path.join(dataDir, "database.db");
const clubsAndSportsDbPath = path.join(dataDir, "clubsAndSports.db");

// Initialize databases
const athletesDb = new Database(dbPath);
const clubsAndSportsDb = new Database(clubsAndSportsDbPath);

console.log("Connected to the SQLite database.");
console.log("Connected to the SQLite clubsAndSports database.");

// Function to create tables
const createTables = (db) => {
  const tables = [
    {
      name: "athletes",
      schema: `
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
      `,
    },
    {
      name: "athlete_contacts", // New table for phone numbers
      schema: `
        athleteId TEXT PRIMARY KEY,
        phoneNumber TEXT,
        FOREIGN KEY (athleteId) REFERENCES athletes(id)
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
        supplement TEXT,
        date TEXT,
        FOREIGN KEY (athleteId) REFERENCES athletes(id)
      `,
    },
    {
      name: "tournaments",
      schema: `
        id TEXT PRIMARY KEY,
        athleteId TEXT,
        date TEXT,
        tournamentName TEXT,
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
        weight TEXT,
        fats TEXT,
        muscle TEXT,
        water REAL,
        FOREIGN KEY (athleteId) REFERENCES athletes(id)
      `,
    },
    {
      name: "customTable",
      schema: `
        athleteId TEXT PRIMARY KEY,
        tableHead TEXT,
        tableRows TEXT,
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
    {
      name: "files",
      schema: `
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        athleteId TEXT,
        name TEXT,
        path TEXT,
        uploadDate TEXT,
        FOREIGN KEY (athleteId) REFERENCES athletes(id)
      `,
    },
  ];

  tables.forEach(({ name, schema }) => {
    const query = `CREATE TABLE IF NOT EXISTS ${name} (${schema})`;
    try {
      db.exec(query); // Use .exec() for DDL queries
      console.log(`Table ${name} ensured.`);
    } catch (err) {
      console.error(`Error creating table ${name}:`, err.message);
    }
  });
};

// Initialize the tables if they don't exist in both databases
createTables(athletesDb);
createTables(clubsAndSportsDb);

// Export the databases
export { athletesDb, clubsAndSportsDb };
