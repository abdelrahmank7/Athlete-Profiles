import {
  deleteHistoryRecord,
  deleteNote,
  deleteSupplement,
  deleteAppointment,
  showEditModal,
  addNote,
  addSupplement,
  addTournament,
  saveTableData, // Ensure saveTableData is imported
  loadTableData,
} from "./athlete-helpers.js";

function safeAddEventListener(id, event, handler) {
  const element = document.getElementById(id);
  if (element) {
    element.addEventListener(event, handler);
  } else {
    console.error(`Element with id "${id}" not found.`);
  }
}

export function addFormAndTableEventListeners(athleteId) {
  safeAddEventListener("note-form", "submit", (event) => {
    event.preventDefault();
    const note = document.getElementById("note-input").value;
    addNote(athleteId, note);
  });

  safeAddEventListener("supplement-form", "submit", (event) => {
    event.preventDefault();
    const note = document.getElementById("supplement-input").value;
    addSupplement(athleteId, note);
  });

  safeAddEventListener("appointment-form", "submit", (event) => {
    event.preventDefault();
    const date = document.getElementById("appointment-input").value;
    const tournamentName = document.getElementById(
      "tournament-name-input"
    ).value;
    addTournament(athleteId, { date, tournamentName });
  });

  setInterval(() => {
    console.log("Interval - Athlete ID:", window.currentAthleteID); // Log current athlete ID during interval
    saveTableData(window.currentAthleteID, {
      /* dummy data for testing */
    });
  }, 10000);

  const table = document.getElementById("custom-table");
  if (table) {
    table.addEventListener("focusout", (event) => {
      const cell = event.target;
      if (
        cell &&
        cell.tagName &&
        cell.tagName.toLowerCase() === "td" &&
        cell.cellIndex === 3
      ) {
        const row = cell.parentElement;
        if (row.rowIndex === table.rows.length - 1) {
          const newRow = table.insertRow();
          for (let i = 0; i < 4; i++) {
            const newCell = newRow.insertCell();
            newCell.contentEditable = "true";
          }
        }
      }
    });
  }
}
