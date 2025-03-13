import { addHistoryRecordToPage } from "./history.js";
import {
  addSupplementToPage,
  addTournamentToPage,
} from "./tournamentsAndSupplements.js";
import { addNoteToPage } from "./setupForms.js";

// Fetch athlete details
export async function fetchAthleteDetails(athleteId) {
  try {
    const res = await fetch(`/api/athletes/${athleteId}`);
    if (!res.ok) {
      throw new Error("Failed to fetch athlete details");
    }
    const athleteDetails = await res.json();
    document.getElementById("athlete-name").textContent = athleteDetails.name;
    document.getElementById("athlete-birthdate").textContent =
      athleteDetails.birthdate;
    document.getElementById("athlete-age").textContent = calculateAge(
      athleteDetails.birthdate
    );
    document.getElementById("athlete-weight").textContent =
      athleteDetails.weight;
    document.getElementById("athlete-target-weight").textContent =
      athleteDetails.targetWeight;
    document.getElementById("athlete-height").textContent =
      athleteDetails.height;
    document.getElementById("athlete-club").textContent = athleteDetails.club;
    document.getElementById("athlete-sport").textContent = athleteDetails.sport;
  } catch (error) {
    console.error("Error fetching athlete details:", error);
  }
}

// Calculate age from birthdate in years and months
function calculateAge(birthdate) {
  const birthDate = new Date(birthdate);
  const now = new Date();

  const years = now.getFullYear() - birthDate.getFullYear();
  const months = now.getMonth() - birthDate.getMonth();

  // Adjust if the birth month hasn't been reached yet this year
  const adjustedMonths = months < 0 ? months + 12 : months;
  const adjustedYears = months < 0 ? years - 1 : years;

  return `${adjustedYears} years and ${adjustedMonths} months`;
}

// Fetch history data
export async function fetchHistory(athleteId) {
  try {
    const res = await fetch(`/api/athletes/${athleteId}/history`);
    if (!res.ok) {
      throw new Error("Failed to fetch history records");
    }
    const historyRecords = await res.json();
    historyRecords.forEach((record) => {
      addHistoryRecordToPage(
        athleteId,
        record.date,
        record.weight,
        record.fats,
        record.muscle,
        record.water, // Ensure water is passed
        record.id
      );
    });
  } catch (error) {
    console.error("Error fetching history records:", error);
  }
}

// Fetch supplements data
export async function fetchSupplements(athleteId) {
  try {
    const res = await fetch(`/api/athletes/${athleteId}/supplements`);
    if (!res.ok) {
      throw new Error("Failed to fetch supplements");
    }
    const supplements = await res.json();
    supplements.forEach((supplement) => {
      addSupplementToPage(
        athleteId,
        supplement.supplement,
        supplement.date,
        supplement.id
      );
    });
  } catch (error) {
    console.error("Error fetching supplements:", error);
  }
}

// Fetch tournaments data
export async function fetchTournaments(athleteId) {
  try {
    const res = await fetch(`/api/athletes/${athleteId}/tournaments`);
    if (!res.ok) {
      throw new Error("Failed to fetch tournaments");
    }
    const tournaments = await res.json();
    tournaments.forEach((tournament) => {
      addTournamentToPage(
        athleteId,
        tournament.tournamentName,
        tournament.date,
        tournament.id
      );
    });
  } catch (error) {
    console.error("Error fetching tournaments:", error);
  }
}

// Fetch notes data
export async function fetchNotes(athleteId) {
  try {
    const res = await fetch(`/api/athletes/${athleteId}/notes`);
    if (!res.ok) {
      throw new Error("Failed to fetch notes");
    }
    const notes = await res.json();
    notes.forEach((note) => {
      addNoteToPage(athleteId, note.note, note.date, note.id);
    });
  } catch (error) {
    console.error("Error fetching notes:", error);
  }
}
