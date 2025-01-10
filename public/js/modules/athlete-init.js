import { fetchAthleteDetails } from "./athlete-helpers.js";

export async function initializeAthletePage(athleteId) {
  console.log("Initializing Athlete Page with ID:", athleteId); // Log athlete ID during initialization

  const athlete = await fetchAthleteDetails(athleteId);

  if (!athlete) {
    document.body.innerHTML =
      '<h1>Athlete not found. Please return to <a href="index.html">Home</a></h1>';
    return;
  }

  document.getElementById("athlete-name").textContent = athlete.name;
  document.getElementById("athlete-birthdate").textContent = athlete.birthdate;
  document.getElementById("athlete-weight").textContent = athlete.weight;
  document.getElementById("athlete-target-weight").textContent =
    athlete.targetWeight;
  document.getElementById("athlete-height").textContent = athlete.height;
  document.getElementById("athlete-club").textContent = athlete.club;
  document.getElementById("athlete-sport").textContent = athlete.sport;

  window.currentAthleteID = athlete.id; // Ensure the correct ID is set
  console.log("Set window.currentAthleteID to:", athlete.id); // Log the set ID

  await loadAdditionalInfo(athlete.id, athlete);
  await populateNotes(athlete.id, athlete.notes);
  await populateSupplements(athlete.id, athlete.supplementNotes);
  await populateAppointments(athlete.id, athlete.appointments);
}
