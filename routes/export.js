// Export athlete data as a SQLite database file
router.post("/:athleteId/export", async (req, res) => {
  const athleteId = req.params.athleteId;

  try {
    // Fetch athlete name from the database
    const query = `SELECT name FROM athletes WHERE id = ?`;
    const stmt = athletesDb.prepare(query);
    const row = stmt.get([athleteId]);
    if (!row) {
      return res.status(404).json({ error: "Athlete not found" });
    }
    const athleteName = row.name;

    // Define the output file path
    const folderName = `${athleteName} (${athleteId})`;
    const exportDir = path.join(__dirname, "../models/data", folderName);
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }
    const exportFilePath = path.join(
      exportDir,
      `${athleteName} (${athleteId}).db`
    );

    // Create a new SQLite database file
    const exportDb = new sqlite3.Database(exportFilePath);

    // Copy tables related to the athlete
    const tables = ["athletes", "notes", "supplements", "tournaments", "files"];
    for (const table of tables) {
      const selectQuery = `SELECT * FROM ${table} WHERE athleteId = ?`;
      const insertQuery = `INSERT INTO ${table} SELECT * FROM ${table} WHERE athleteId = ?`;

      const rows = athletesDb.prepare(selectQuery).all([athleteId]);
      if (rows.length > 0) {
        // Create table in the new database
        const createTableQuery = `CREATE TABLE IF NOT EXISTS ${table} AS SELECT * FROM ${table} WHERE 1=0`;
        exportDb.run(createTableQuery);

        // Insert data into the new database
        const insertStmt = exportDb.prepare(insertQuery);
        for (const row of rows) {
          insertStmt.run([athleteId]);
        }
      }
    }

    // Close the database connection
    exportDb.close();

    res.json({
      message: "Data exported successfully",
      filePath: exportFilePath,
    });
  } catch (err) {
    console.error("Error exporting athlete data:", err.message);
    res.status(500).json({ error: "Failed to export athlete data" });
  }
});
