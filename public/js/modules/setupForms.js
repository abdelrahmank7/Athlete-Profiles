import {
  addHistoryRecordToPage,
  saveHistoryRecordToServer,
} from "./history.js";

import {
  saveSupplementToServer,
  addSupplementToPage,
  saveTournamentToServer,
  addTournamentToPage,
} from "./tournamentsAndSupplements.js";
import { fetchPhoneNumbers } from "./phoneHandler.js";
import { addInjuryToPage, saveInjuryToServer } from "./injuries.js";

// Setup note form
export function setupNoteForm(athleteId) {
  const noteForm = document.getElementById("note-form");
  noteForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const noteInput = document.getElementById("note-input").value;
    if (noteInput.trim()) {
      await saveNoteToServer(athleteId, noteInput, null, (noteId) => {
        addNoteToPage(athleteId, noteInput, null, noteId);
      });
      document.getElementById("note-input").value = "";
    }
  });
}

// Function to add a note to the page
export function addNoteToPage(athleteId, note, date, noteId = null) {
  const notesContent = document.getElementById("notes-content");

  if (!notesContent) {
    console.error("notes-content element not found");
    return;
  }

  const noteElement = document.createElement("div");
  const formattedDate = date || new Date().toISOString().split("T")[0];

  // Create the HTML structure for the note
  noteElement.innerHTML = `
  <p class="note-text" data-date="${formattedDate}">${note}</p>
  <div class="button-container">
    <button class="edit-button"><img src="../assets/images/edit-icon.png" alt="Edit" /></button>
    <button class="remove-button"><img src="../assets/images/delete-icon.png" alt="Remove" /></button>
  </div>
`;

  // Add hover effect with delay
  const noteText = noteElement.querySelector(".note-text");
  let hoverTimeout;

  noteText.addEventListener("mouseenter", (e) => {
    hoverTimeout = setTimeout(() => {
      const tooltip = document.getElementById("date-tooltip");
      tooltip.textContent = noteText.getAttribute("data-date");
      tooltip.style.left = `${e.pageX + 10}px`; // Position near the mouse
      tooltip.style.top = `${e.pageY + 10}px`;
      tooltip.style.display = "block";
    }, 1000); // 1-second delay
  });

  noteText.addEventListener("mouseleave", () => {
    clearTimeout(hoverTimeout);
    document.getElementById("date-tooltip").style.display = "none";
  });

  // Add event listener for the remove button
  noteElement
    .querySelector(".remove-button")
    .addEventListener("click", async (event) => {
      event.preventDefault();
      if (noteId) {
        await deleteNoteFromServer(athleteId, noteId);
      }
      noteElement.remove();
    });

  // Add event listener for the edit button
  noteElement
    .querySelector(".edit-button")
    .addEventListener("click", (event) => {
      event.preventDefault();
      const noteText = noteElement.querySelector(".note-text");
      const editButton = noteElement.querySelector(".edit-button img");
      if (noteText.contentEditable === "true") {
        noteText.contentEditable = "false";
        editButton.src = "../assets/images/edit-icon.png";
        if (noteId) {
          updateNoteOnServer(athleteId, noteId, noteText.textContent);
        }
      } else {
        noteText.contentEditable = "true";
        noteText.focus();
        editButton.src = "../assets/images/save-icon.png";
      }
    });

  // Save the note to the server if it's a new note
  if (!noteId) {
    saveNoteToServer(athleteId, note, formattedDate, (id) => {
      noteId = id; // Update the noteId after saving to the server
    });
  }

  // Insert the new note at the beginning of the notes-content container
  notesContent.insertBefore(noteElement, notesContent.firstChild);
}

// Function to save the note to the server
async function saveNoteToServer(athleteId, note, date, callback) {
  try {
    const res = await fetch(`/api/athletes/${athleteId}/notes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ note, date }),
    });
    const result = await res.json();
    callback(result.id);
  } catch (error) {
    console.error("Error saving note:", error);
  }
}

// Function to update the note on the server
async function updateNoteOnServer(athleteId, noteId, note) {
  try {
    await fetch(`/api/athletes/${athleteId}/notes/${noteId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ note }),
    });
  } catch (error) {
    console.error("Error updating note:", error);
  }
}

// Function to delete the note from the server
async function deleteNoteFromServer(athleteId, noteId) {
  try {
    await fetch(`/api/athletes/${athleteId}/notes/${noteId}`, {
      method: "DELETE",
    });
  } catch (error) {
    console.error("Error deleting note:", error);
  }
}

// Setup supplement form
export function setupSupplementForm(athleteId) {
  const supplementForm = document.getElementById("supplement-form");
  supplementForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const supplementInput = document.getElementById("supplement-input").value;
    const date = new Date().toISOString().split("T")[0];
    if (supplementInput.trim()) {
      await saveSupplementToServer(
        athleteId,
        supplementInput,
        date,
        (supplementId) => {
          addSupplementToPage(athleteId, supplementInput, date, supplementId);
        }
      );
      document.getElementById("supplement-input").value = "";
    }
  });
}

// Setup tournament form
export function setupTournamentForm(athleteId) {
  const tournamentForm = document.getElementById("tournament-form");
  if (tournamentForm) {
    tournamentForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const tournamentNameInput = document.getElementById(
        "tournament-name-input"
      ).value;
      const dateInput = document.getElementById("tournament-date-input").value;
      if (tournamentNameInput.trim() && dateInput.trim()) {
        await saveTournamentToServer(
          athleteId,
          tournamentNameInput,
          dateInput,
          (tournamentId) => {
            addTournamentToPage(
              athleteId,
              tournamentNameInput,
              dateInput,
              tournamentId
            );
          }
        );
        document.getElementById("tournament-name-input").value = "";
        document.getElementById("tournament-date-input").value = "";
      }
    });
  } else {
    console.error("Tournament form not found");
  }
}

// Setup history form
export function setupHistoryForm(athleteId) {
  const historyForm = document.getElementById("history-form");
  historyForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const date = new Date().toISOString().split("T")[0];
    const weight = document.getElementById("history-weight-input").value;
    const fats = document.getElementById("history-fats-input").value;
    const muscle = document.getElementById("history-muscle-input").value;
    const water = document.getElementById("history-water-input").value; // Extract water value

    if (weight.trim() && fats.trim() && muscle.trim() && water.trim()) {
      await saveHistoryRecordToServer(
        athleteId,
        date,
        weight,
        fats,
        muscle,
        water, // Pass water to the server
        (id) => {
          addHistoryRecordToPage(
            athleteId,
            date,
            weight,
            fats,
            muscle,
            water, // Include water here
            id
          );
        }
      );
      // Clear all inputs
      document.getElementById("history-weight-input").value = "";
      document.getElementById("history-fats-input").value = "";
      document.getElementById("history-muscle-input").value = "";
      document.getElementById("history-water-input").value = ""; // Clear water input
    }
  });
}

// Setup edit athlete form
export function setupEditAthleteForm(athleteId) {
  const editButton = document.getElementById("edit-athlete-button");
  editButton.addEventListener("click", () => {
    const athleteDetails = document.getElementById("athlete-details");

    // Toggle edit mode
    const isEditable = athleteDetails.contentEditable === "true";
    athleteDetails.contentEditable = isEditable ? "false" : "true";
    editButton.textContent = isEditable ? "Edit" : "Save";

    if (isEditable) {
      // Extract updated details
      const updatedDetails = {
        name: document.getElementById("athlete-name").textContent,
        birthdate: document.getElementById("athlete-birthdate").textContent,
        weight: document.getElementById("athlete-weight").textContent,
        targetWeight: document.getElementById("athlete-target-weight")
          .textContent,
        height: document.getElementById("athlete-height").textContent,
        club: document.getElementById("athlete-club").textContent,
        sport: document.getElementById("athlete-sport").textContent,
      };

      // Update athlete details on the server using the new route
      saveAthleteDetailsToServer(athleteId, updatedDetails);
    }
  });
}

// Save the updated athlete details to the server
async function saveAthleteDetailsToServer(athleteId, details) {
  try {
    const res = await fetch(`/api/athletes/${athleteId}/update`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(details),
    });
    if (!res.ok) {
      throw new Error("Failed to update athlete details");
    }
    console.log("Athlete details updated successfully");
  } catch (error) {
    console.error("Error updating athlete details:", error);
  }
}

// Fetch and display phone number

export async function setupPhoneNumberDisplay(athleteId) {
  try {
    const phoneNumbers = await fetchPhoneNumbers(athleteId);
    const phoneNumberElement = document.getElementById("athlete-phone-number");
    if (phoneNumberElement) {
      phoneNumberElement.textContent = phoneNumbers.phoneNumber || "N/A";
    } else {
      console.error("Phone number element not found");
    }
  } catch (error) {
    console.error("Error setting up phone number display:", error);
  }
}

// Setup injury form
export function setupInjuryForm(athleteId) {
  const injuryForm = document.getElementById("injury-form");
  if (injuryForm) {
    injuryForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const injuryInput = document.getElementById("injury-input");
      const injuryDateInput = document.getElementById("injury-date-input");
      const injury = injuryInput.value;
      const date = injuryDateInput.value;

      if (!injury || !date) {
        showModal("All fields are required.");
        return;
      }

      try {
        await saveInjuryToServer(athleteId, injury, date, (id) => {
          addInjuryToPage(athleteId, injury, date, id);
        });
        injuryInput.value = "";
        injuryDateInput.value = "";
      } catch (error) {
        console.error("Error adding injury:", error);
        showModal("Error adding injury.");
      }
    });
  }
}
