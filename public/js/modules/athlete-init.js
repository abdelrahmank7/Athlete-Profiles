// Initialize athlete page
export async function initializeAthletePage(athleteId) {
  console.log(`Initializing athlete page for ID: ${athleteId}`);

  await fetchAthleteDetails(athleteId);
  await fetchSupplements(athleteId);
  await fetchTournaments(athleteId);
  await fetchNotes(athleteId);
  setupNoteForm(athleteId);
  setupSupplementForm(athleteId);
  setupTournamentForm(athleteId);
  setupEditAthleteForm(athleteId); // Setup the edit athlete form
}

// Fetch athlete details and populate the General Information section
async function fetchAthleteDetails(athleteId) {
  try {
    const res = await fetch(`/api/athletes/${athleteId}`);
    if (!res.ok) {
      throw new Error("Failed to fetch athlete details");
    }
    const athlete = await res.json();
    document.getElementById("athlete-name").textContent = athlete.name;
    document.getElementById("athlete-birthdate").textContent =
      athlete.birthdate;
    document.getElementById("athlete-age").textContent = calculateAge(
      athlete.birthdate
    );
    document.getElementById("athlete-weight").textContent = athlete.weight;
    document.getElementById("athlete-target-weight").textContent =
      athlete.targetWeight;
    document.getElementById("athlete-height").textContent = athlete.height;
    document.getElementById("athlete-club").textContent = athlete.club;
    document.getElementById("athlete-sport").textContent = athlete.sport;
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

// Setup the edit athlete form
function setupEditAthleteForm(athleteId) {
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
    const res = await fetch(`/api/athletes/${athleteId}/general-info`, {
      method: "PUT",
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

// Fetch tournaments for the athlete
async function fetchTournaments(athleteId) {
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

function addTournamentToPage(
  athleteId,
  tournamentName,
  date,
  tournamentId = null
) {
  const tournamentsContent = document.getElementById("tournaments-content");
  const tournamentElement = document.createElement("div");
  const formattedDate = date || new Date().toISOString().split("T")[0];

  tournamentElement.innerHTML = `
    <p class="tournament-text">${formattedDate}: ${tournamentName}</p>
    <div class="tournament-button-container">
      <button class="edit-button"><img src="../assets/images/edit-icon.png" alt="Edit" /></button>
      <button class="remove-button"><img src="../assets/images/delete-icon.png" alt="Remove" /></button>
    </div>
  `;
  tournamentsContent.appendChild(tournamentElement);

  // Add event listener for the remove button
  tournamentElement
    .querySelector(".remove-button")
    .addEventListener("click", async (event) => {
      event.preventDefault();
      if (tournamentId) {
        await deleteTournamentFromServer(athleteId, tournamentId);
      }
      tournamentElement.remove();
    });

  // Add event listener for the edit button
  tournamentElement
    .querySelector(".edit-button")
    .addEventListener("click", (event) => {
      event.preventDefault();
      const tournamentText =
        tournamentElement.querySelector(".tournament-text");
      const editButton = tournamentElement.querySelector(".edit-button img");

      if (tournamentText.contentEditable === "true") {
        tournamentText.contentEditable = "false";
        editButton.src = "../assets/images/edit-icon.png";
        if (tournamentId) {
          updateTournamentOnServer(
            athleteId,
            tournamentId,
            tournamentText.textContent
          );
        }
      } else {
        tournamentText.contentEditable = "true";
        tournamentText.focus();
        editButton.src = "../assets/images/save-icon.png";
      }
    });

  if (!tournamentId) {
    saveTournamentToServer(athleteId, tournamentName, formattedDate, (id) => {
      tournamentId = id;
    });
  }
}

// Helper functions for tournament operations
async function saveTournamentToServer(
  athleteId,
  tournamentName,
  date,
  callback
) {
  try {
    const requestData = { tournamentName, date };
    console.log("Sending data:", requestData);
    const res = await fetch(`/api/athletes/${athleteId}/tournaments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    });
    if (!res.ok) {
      const errorData = await res.json();
      console.error("Error saving tournament:", errorData);
      return;
    }
    const result = await res.json();
    callback(result.id);
  } catch (error) {
    console.error("Error saving tournament:", error);
  }
}

async function updateTournamentOnServer(athleteId, tournamentId, tournament) {
  try {
    const [formattedDate, tournamentName] = tournament.split(": ");
    await fetch(`/api/athletes/${athleteId}/tournaments/${tournamentId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ date: formattedDate, tournamentName }),
    });
  } catch (error) {
    console.error("Error updating tournament:", error);
  }
}

async function deleteTournamentFromServer(athleteId, tournamentId) {
  try {
    await fetch(`/api/athletes/${athleteId}/tournaments/${tournamentId}`, {
      method: "DELETE",
    });
  } catch (error) {
    console.error("Error deleting tournament:", error);
  }
}

function setupTournamentForm(athleteId) {
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

// Fetch supplements for the athlete
async function fetchSupplements(athleteId) {
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

// async function fetchAthleteDetails(athleteId) {
//   try {
//     const res = await fetch(`/api/athletes/${athleteId}`);
//     if (!res.ok) {
//       throw new Error("Athlete not found");
//     }
//     const athlete = await res.json();

//     if (!athlete) {
//       document.body.innerHTML =
//         '<h1>Athlete not found. Please return to <a href="/">Home</a></h1>';
//       return;
//     }

//     document.getElementById("athlete-name").textContent = athlete.name;

//     // Fetch and display notes
//     await fetchNotes(athleteId);
//     console.log(`Athlete Name: ${athlete.name}`);
//   } catch (error) {
//     console.error("Error fetching athlete details:", error);
//     document.body.innerHTML =
//       '<h1>Athlete not found. Please return to <a href="/">Home</a></h1>';
//   }
// }

async function fetchNotes(athleteId) {
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

function addNoteToPage(athleteId, note, date, noteId = null) {
  const notesContent = document.getElementById("notes-content");
  const noteElement = document.createElement("div");
  const formattedDate = date || new Date().toISOString().split("T")[0];

  noteElement.innerHTML = `
      <p class="note-text">${formattedDate}: ${note}</p>
      <div class="button-container">
        <button class="edit-button"><img src="../assets/images/edit-icon.png" alt="Edit" /></button>
        <button class="remove-button"><img src="../assets/images/delete-icon.png" alt="Remove" /></button>
      </div>
    `;
  notesContent.appendChild(noteElement);

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

  if (!noteId) {
    saveNoteToServer(athleteId, note, formattedDate, (id) => {
      noteId = id;
    });
  }
}

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

async function deleteNoteFromServer(athleteId, noteId) {
  try {
    await fetch(`/api/athletes/${athleteId}/notes/${noteId}`, {
      method: "DELETE",
    });
  } catch (error) {
    console.error("Error deleting note:", error);
  }
}

function setupNoteForm(athleteId) {
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

function addSupplementToPage(athleteId, supplement, date, supplementId = null) {
  const supplementsContent = document.getElementById("supplements-content");
  const supplementElement = document.createElement("div");
  const formattedDate = date || new Date().toISOString().split("T")[0];

  supplementElement.innerHTML = `
      <p class="supplement-text">${formattedDate}: ${supplement}</p>
      <div class="supplement-button-container">
        <button class="edit-button"><img src="../assets/images/edit-icon.png" alt="Edit" /></button>
        <button class="remove-button"><img src="../assets/images/delete-icon.png" alt="Remove" /></button>
      </div>
    `;
  supplementsContent.appendChild(supplementElement);

  // Add event listener for the remove button
  supplementElement
    .querySelector(".remove-button")
    .addEventListener("click", async (event) => {
      event.preventDefault();
      if (supplementId) {
        await deleteSupplementFromServer(athleteId, supplementId);
      }
      supplementElement.remove();
    });

  // Add event listener for the edit button
  supplementElement
    .querySelector(".edit-button")
    .addEventListener("click", (event) => {
      event.preventDefault();
      const supplementText =
        supplementElement.querySelector(".supplement-text");
      const editButton = supplementElement.querySelector(".edit-button img");

      if (supplementText.contentEditable === "true") {
        supplementText.contentEditable = "false";
        editButton.src = "../assets/images/edit-icon.png";
        if (supplementId) {
          updateSupplementOnServer(
            athleteId,
            supplementId,
            supplementText.textContent
          );
        }
      } else {
        supplementText.contentEditable = "true";
        supplementText.focus();
        editButton.src = "../assets/images/save-icon.png";
      }
    });

  if (!supplementId) {
    saveSupplementToServer(athleteId, supplement, formattedDate, (id) => {
      supplementId = id;
    });
  }
}

// Helper functions for supplement operations
async function saveSupplementToServer(athleteId, supplement, date, callback) {
  try {
    const requestData = { supplement, date };
    console.log("Sending data:", requestData);
    const res = await fetch(`/api/athletes/${athleteId}/supplements`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ supplement, date }),
    });
    if (!res.ok) {
      const errorData = await res.json();
      console.error("Error saving supplement:", errorData);
      return;
    }
    const result = await res.json();
    callback(result.id);
  } catch (error) {
    console.error("Error saving supplement:", error);
  }
}

async function updateSupplementOnServer(athleteId, supplementId, supplement) {
  try {
    await fetch(`/api/athletes/${athleteId}/supplements/${supplementId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ supplement }),
    });
  } catch (error) {
    console.error("Error updating supplement:", error);
  }
}

async function deleteSupplementFromServer(athleteId, supplementId) {
  try {
    await fetch(`/api/athletes/${athleteId}/supplements/${supplementId}`, {
      method: "DELETE",
    });
  } catch (error) {
    console.error("Error deleting supplement:", error);
  }
}
function setupSupplementForm(athleteId) {
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
