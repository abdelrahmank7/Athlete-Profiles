const express = require("express");
const { athletesDb } = require("../models/database");
const router = express.Router();

// Save custom table data for an athlete
router.post("/:id/custom-table", (req, res) => {
  const { id } = req.params;
  const { tableData } = req.body;

  athletesDb.update(
    { _id: id },
    { $set: { customTable: tableData } },
    {},
    (err) => {
      if (err) return res.status(500).send(err);
      res.status(200).send({ message: "Table data saved successfully" });
    }
  );
});

module.exports = router;
