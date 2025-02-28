import {
  fetchAthleteDetails,
  fetchSupplements,
  fetchTournaments,
  fetchNotes,
  fetchHistory,
} from "./fetchData.js";
import {
  setupNoteForm,
  setupSupplementForm,
  setupTournamentForm,
  setupHistoryForm,
  setupEditAthleteForm,
} from "./setupForms.js";
import { initializeCustomTable } from "./customTable.js";
import { setupFileUpload } from "./importFiles.js";
import { initializeSaveButton } from "./export.js";

// Initialize the athlete page with all necessary data and forms
export async function initializeAthletePage(athleteId) {
  console.log(`Initializing athlete page for ID: ${athleteId}`);

  // Set the athleteId in the hidden input field
  document.getElementById("athlete-id").value = athleteId;

  await fetchAthleteDetails(athleteId);
  await fetchSupplements(athleteId);
  await fetchTournaments(athleteId);
  await fetchNotes(athleteId);
  await fetchHistory(athleteId); // Ensure this function is called
  initializeSaveButton(); // Initialize the save button
  setupNoteForm(athleteId);
  setupSupplementForm(athleteId);
  setupTournamentForm(athleteId);
  setupHistoryForm(athleteId); // Setup the history form
  setupEditAthleteForm(athleteId); // Setup the edit athlete form
  initializeCustomTable(athleteId); // Initialize custom table
  setupFileUpload(athleteId); // Setup file upload
}
