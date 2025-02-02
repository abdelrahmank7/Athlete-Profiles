import express from "express";
import { athletesDb } from "../models/database.js";

const router = express.Router();

// Fetch custom table data for an athlete
router.get("/:athleteId/custom-table", (req, res) => {
  const { athleteId } = req.params;
  const query =
    "SELECT tableHead, tableRows FROM customTable WHERE athleteId = ?";
  console.log(`Fetching custom table data for athlete: ${athleteId}`);

  athletesDb.get(query, [athleteId], (err, row) => {
    if (err) {
      console.error("Error fetching custom table data:", err.message);
      return res
        .status(500)
        .json({ error: "Failed to fetch custom table data" });
    }
    if (!row) {
      console.warn(`Custom table data not found for athlete: ${athleteId}`);
      return res.json({
        customTable: [],
        tableHead: ["Column 1", "Column 2", "Column 3", "Column 4"],
      });
    }
    try {
      const tableHead = JSON.parse(row.tableHead);
      const customTable = JSON.parse(row.tableRows);
      res.json({ customTable, tableHead });
    } catch (parseError) {
      console.error("Error parsing custom table data:", parseError.message);
      res.status(500).json({ error: "Failed to parse custom table data" });
    }
  });
});

// Save custom table data for an athlete
router.put("/:athleteId/custom-table", (req, res) => {
  const { athleteId } = req.params;
  const { tableHead, tableRows } = req.body;

  if (!Array.isArray(tableHead) || !Array.isArray(tableRows)) {
    return res.status(400).json({ error: "Invalid table data format" });
  }

  const processedTableHead = JSON.stringify(tableHead);
  const processedTableRows = JSON.stringify(tableRows);
  const query = `
    INSERT INTO customTable (athleteId, tableHead, tableRows) VALUES (?, ?, ?)
    ON CONFLICT(athleteId) DO UPDATE SET tableHead = excluded.tableHead, tableRows = excluded.tableRows
  `;

  athletesDb.run(
    query,
    [athleteId, processedTableHead, processedTableRows],
    (err) => {
      if (err) {
        console.error("Error saving custom table data:", err.message);
        return res
          .status(500)
          .json({ error: "Failed to save custom table data" });
      }
      console.log(`Table data saved successfully for athlete: ${athleteId}`);
      res.status(200).json({ message: "Table data saved successfully" });
    }
  );
});

export default router;
