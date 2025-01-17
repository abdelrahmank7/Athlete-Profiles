import { initializeAthletePage } from "./modules/athlete-init.js";
import {
  addFormAndTableEventListeners,
  addHistoryEventListeners,
  addNotesEventListeners,
  addSupplementsEventListeners,
  addAppointmentsEventListeners,
} from "./modules/athlete-event-listeners.js";

document.addEventListener("DOMContentLoaded", async () => {
  const athleteId = new URLSearchParams(window.location.search).get("id");
  console.log("Athlete ID from URL:", athleteId); // Log athlete ID from URL

  if (!athleteId) {
    document.body.innerHTML =
      '<h1>Athlete not found. Please return to <a href="/">Home</a></h1>';
    return;
  }

  await initializeAthletePage(athleteId);
  addHistoryEventListeners();
  addNotesEventListeners();
  addSupplementsEventListeners();
  addAppointmentsEventListeners();
  addFormAndTableEventListeners(athleteId); // Pass athleteId to the function
  handleFormSubmissions(athleteId);
});

function handleFormSubmissions(athleteId) {
  // Implement form submission handling
}
