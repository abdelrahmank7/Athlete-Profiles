import { fetchAndDisplayAthletes } from "./helpers.js";

export function addEventListeners() {
  document
    .getElementById("search")
    .addEventListener("input", fetchAndDisplayAthletes);
  document
    .getElementById("sport-filter")
    .addEventListener("change", fetchAndDisplayAthletes);
  document
    .getElementById("club-filter")
    .addEventListener("change", fetchAndDisplayAthletes);
}
