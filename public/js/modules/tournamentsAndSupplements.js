// Fetch tournaments for the athlete
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

// Add tournament to the page
export function addTournamentToPage(
  athleteId,
  tournamentName,
  date,
  tournamentId = null
) {
  const tournamentsContent = document.getElementById("tournaments-content");

  if (!tournamentsContent) {
    console.error("tournaments-content element not found");
    return;
  }

  const tournamentElement = document.createElement("div");
  const formattedDate = date || new Date().toISOString().split("T")[0];

  // Create the HTML structure for the tournament
  tournamentElement.innerHTML = `
    <p class="tournament-text">${formattedDate}: ${tournamentName}</p>
    <div class="tournament-button-container">
      <button class="edit-button"><img src="../assets/images/edit-icon.png" alt="Edit" /></button>
      <button class="remove-button"><img src="../assets/images/delete-icon.png" alt="Remove" /></button>
    </div>
  `;

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

  // Save the tournament to the server if it's a new tournament
  if (!tournamentId) {
    saveTournamentToServer(athleteId, tournamentName, formattedDate, (id) => {
      tournamentId = id; // Update the tournamentId after saving to the server
    });
  }

  // Insert the new tournament at the beginning of the tournaments-content container
  tournamentsContent.insertBefore(
    tournamentElement,
    tournamentsContent.firstChild
  );
}

// Helper functions for tournament operations
export async function saveTournamentToServer(
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

export async function updateTournamentOnServer(
  athleteId,
  tournamentId,
  tournament
) {
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

export async function deleteTournamentFromServer(athleteId, tournamentId) {
  try {
    await fetch(`/api/athletes/${athleteId}/tournaments/${tournamentId}`, {
      method: "DELETE",
    });
  } catch (error) {
    console.error("Error deleting tournament:", error);
  }
}

// Fetch supplements for the athlete
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

// Add supplement to the page
export function addSupplementToPage(
  athleteId,
  supplement,
  date,
  supplementId = null
) {
  const supplementsContent = document.getElementById("supplements-content");

  if (!supplementsContent) {
    console.error("supplements-content element not found");
    return;
  }

  const supplementElement = document.createElement("div");
  const formattedDate = date || new Date().toISOString().split("T")[0];

  // Create the HTML structure for the supplement
  supplementElement.innerHTML = `
      <p class="supplement-text">${formattedDate}: ${supplement}</p>
      <div class="supplement-button-container">
        <button class="edit-button"><img src="../assets/images/edit-icon.png" alt="Edit" /></button>
        <button class="remove-button"><img src="../assets/images/delete-icon.png" alt="Remove" /></button>
      </div>
    `;

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

  // Save the supplement to the server if it's a new supplement
  if (!supplementId) {
    saveSupplementToServer(athleteId, supplement, formattedDate, (id) => {
      supplementId = id; // Update the supplementId after saving to the server
    });
  }

  // Insert the new supplement at the beginning of the supplements-content container
  supplementsContent.insertBefore(
    supplementElement,
    supplementsContent.firstChild
  );
}

// Helper functions for supplement operations
export async function saveSupplementToServer(
  athleteId,
  supplement,
  date,
  callback
) {
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

export async function updateSupplementOnServer(
  athleteId,
  supplementId,
  supplement
) {
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

export async function deleteSupplementFromServer(athleteId, supplementId) {
  try {
    await fetch(`/api/athletes/${athleteId}/supplements/${supplementId}`, {
      method: "DELETE",
    });
  } catch (error) {
    console.error("Error deleting supplement:", error);
  }
}
