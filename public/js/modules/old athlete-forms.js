import { fetchAthleteDetails } from "./athlete-helpers.js";

export function handleFormSubmissions(athleteId) {
  const noteForm = document.getElementById("note-form");
  if (noteForm) {
    noteForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      console.log("Note form submitted");
      const note = document.getElementById("note-input").value;
      await saveNote(athleteId, note);
      document.getElementById("note-input").value = "";
      await fetchAthleteDetails(athleteId);
    });
  }

  const supplementForm = document.getElementById("supplement-form");
  if (supplementForm) {
    supplementForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      console.log("Supplement form submitted");
      const note = document.getElementById("supplement-input").value;
      await saveSupplement(athleteId, note);
      document.getElementById("supplement-input").value = "";
      await fetchAthleteDetails(athleteId);
    });
  }

  const appointmentForm = document.getElementById("appointment-form");
  if (appointmentForm) {
    appointmentForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      console.log("Appointment form submitted");
      const date = document.getElementById("appointment-input").value;
      const tournamentName = document.getElementById(
        "tournament-name-input"
      ).value;
      await saveAppointment(athleteId, date, tournamentName);
      document.getElementById("appointment-input").value = "";
      document.getElementById("tournament-name-input").value = "";
      await fetchAthleteDetails(athleteId);
    });
  }
}

async function saveNote(athleteId, note) {
  console.log("Saving note:", note);
  const response = await fetch(`/api/athletes/${athleteId}/notes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      note,
      date: new Date().toISOString().split("T")[0],
    }),
  });
  console.log("Note response status:", response.status);
}

async function saveSupplement(athleteId, note) {
  console.log("Saving supplement note:", note);
  const response = await fetch(`/api/athletes/${athleteId}/supplements`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      note,
      date: new Date().toISOString().split("T")[0],
    }),
  });
  console.log("Supplement response status:", response.status);
}

async function saveAppointment(athleteId, date, tournamentName) {
  console.log("Saving appointment:", date, tournamentName);
  const response = await fetch(`/api/athletes/${athleteId}/appointments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ date, tournamentName }),
  });
  console.log("Appointment response status:", response.status);
}
