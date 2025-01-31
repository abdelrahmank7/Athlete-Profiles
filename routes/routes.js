import express from "express";
import athletesRoutes from "./athletes.js";
import clubsRoutes from "./clubs.js";
import sportsRoutes from "./sports.js";
import filtersRoutes from "./filters.js";
import notesRoutes from "./notes.js";
import supplementsRoutes from "./supplements.js";
import tournamentsRoutes from "./tournaments.js";
import historyRoutes from "./history.js";
import customTableRoutes from "./customTable.js";
import generalInfoRoutes from "./generalInfo.js";

const router = express.Router();

router.use("/athletes", athletesRoutes);
router.use("/clubs", clubsRoutes);
router.use("/sports", sportsRoutes);
router.use("/filters", filtersRoutes);
router.use("/athletes", notesRoutes);
router.use("/athletes", supplementsRoutes);
router.use("/athletes", tournamentsRoutes);
router.use("/athletes", historyRoutes);
router.use("/athletes", generalInfoRoutes);
router.use("/athletes", customTableRoutes);
export default router;
