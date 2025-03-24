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
import { setupPhoneNumberDisplay } from "./setupForms.js";
import { fetchInjuries } from "./injuries.js"; // Import the fetchInjuries function

// Function to set the background image based on the sport
function setBackgroundImage(sport) {
  const mainElement = document.querySelector("main");
  const imagePath = `../assets/images/sports-backgrounds/${sport.toLowerCase()}.jpg`;

  fetch(imagePath)
    .then((response) => {
      if (response.ok) {
        mainElement.style.backgroundImage = `url(${imagePath})`;
      } else {
        console.warn(`Background image for sport "${sport}" not found.`);
        mainElement.style.backgroundImage = "none"; // Fallback
      }
    })
    .catch((error) => {
      console.error("Error loading background image:", error);
    });
}

// Initialize the athlete page with all necessary data and forms
export async function initializeAthletePage(athleteId) {
  console.log(`Initializing athlete page for ID: ${athleteId}`);

  // Set the athleteId in the hidden input field
  document.getElementById("athlete-id").value = athleteId;

  const athleteDetails = await fetchAthleteDetails(athleteId);
  if (athleteDetails && athleteDetails.sport) {
    setBackgroundImage(athleteDetails.sport);
  }

  await fetchSupplements(athleteId);
  await fetchTournaments(athleteId);
  await fetchNotes(athleteId);
  await fetchHistory(athleteId); // Ensure this function is called
  await fetchInjuries(athleteId); // Fetch injuries
  initializeSaveButton(); // Initialize the save button
  setupNoteForm(athleteId);
  setupSupplementForm(athleteId);
  setupTournamentForm(athleteId);
  setupHistoryForm(athleteId); // Setup the history form
  setupEditAthleteForm(athleteId); // Setup the edit athlete form
  initializeCustomTable(athleteId); // Initialize custom table
  setupFileUpload(athleteId); // Setup file upload
  setupPhoneNumberDisplay(athleteId); // Setup phone number display
}
