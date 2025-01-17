import express from "express";
import { clubsAndSportsDb } from "../models/database.js";

const router = express.Router();

// Get all clubs and sports
router.get("/", (req, res) => {
  clubsAndSportsDb.find(
    { $or: [{ type: "club" }, { type: "sport" }] },
    (err, docs) => {
      if (err) {
        console.error("Error fetching clubs and sports:", err);
        return res
          .status(500)
          .json({ error: "Failed to fetch clubs and sports" });
      }

      const clubs = docs
        .filter((doc) => doc.type === "club")
        .map((doc) => doc.value);
      const sports = docs
        .filter((doc) => doc.type === "sport")
        .map((doc) => doc.value);

      res.status(200).json({ clubs, sports });
    }
  );
});

export default router;
