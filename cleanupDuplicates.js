const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Connect to the SQLite database
const dbPath = path.join(__dirname, "models", "data", "database.db");
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Error opening database:", err.message);
  } else {
    console.log("Connected to the SQLite database.");
  }
});

// Function to clean up duplicate records
async function cleanUpDuplicates() {
  // Find duplicate athletes by name
  db.all(
    `
    SELECT id, name, COUNT(*) as count
    FROM athletes
    GROUP BY name
    HAVING count > 1
  `,
    (err, rows) => {
      if (err) {
        return console.error("Error finding duplicates:", err.message);
      }

      // Iterate through the duplicates and delete the extra entries
      rows.forEach((row) => {
        db.serialize(() => {
          db.run(
            `
          DELETE FROM athletes
          WHERE name = ?
          AND id != ?
        `,
            [row.name, row.id],
            (err) => {
              if (err) {
                console.error("Error deleting duplicate:", err.message);
              } else {
                console.log("Duplicate deleted for athlete:", row.name);
              }
            }
          );
        });
      });

      console.log("Duplicate records cleanup completed.");
    }
  );
}

// Initial run
cleanUpDuplicates();

// Run the cleanup function every 10 minutes + 1 second
setInterval(cleanUpDuplicates, 600001);
