import {
  fetchAndDisplayAthletes,
  fetchAndDisplayClubs,
  fetchAndDisplaySports,
} from "./helpers.js";

export function initializeApp() {
  console.log("App initialized");
  fetchAndDisplayAthletes();
  fetchAndDisplayClubs();
  fetchAndDisplaySports();
}
