export async function fetchAthleteDetails(athleteId) {
  console.log("Fetching details for Athlete ID:", athleteId); // Log athlete ID when fetching details

  try {
    const res = await fetch(`http://localhost:4000/api/athletes/${athleteId}`);
    if (!res.ok) {
      throw new Error("Athlete not found");
    }
    const athlete = await res.json();

    if (!athlete) {
      console.error("No athlete data received");
      document.body.innerHTML =
        '<h1>Athlete not found. Please return to <a href="index.html">Home</a></h1>';
      return null;
    }

    const athleteDetails = `
      <p>Name: ${athlete.name}</p>
      <p>Birthdate: ${athlete.birthdate}</p>
      <p>Weight: ${athlete.weight}</p>
      <p>Target Weight: ${athlete.targetWeight}</p>
      <p>Height: ${athlete.height}</p>
      <p>Club: ${athlete.club}</p>
      <p>Sport: ${athlete.sport}</p>
    `;

    document.getElementById("athlete-name").textContent = athlete.name;
    document.getElementById("athlete-details").innerHTML = athleteDetails;

    window.currentAthleteID = athlete.id; // Ensure the correct ID is set
    console.log("Set window.currentAthleteID to:", athlete.id); // Log the set ID

    await loadAdditionalInfo(athlete.id, athlete);
    await populateNotes(athlete.id, athlete.notes);
    await populateSupplements(athlete.id, athlete.supplementNotes);
    await populateAppointments(athlete.id, athlete.appointments);
  } catch (error) {
    console.error("Error fetching athlete details:", error);
    document.body.innerHTML =
      '<h1>Athlete not found. Please return to <a href="index.html">Home</a></h1>';
    return null;
  }
}

export async function deleteHistoryRecord(athleteId, recordId) {
  const response = await fetch(
    `/api/athletes/${athleteId}/history/${recordId}`,
    {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    }
  );

  if (response.ok) {
    showModal("History record deleted successfully.");
    await fetchAthleteDetails(athleteId);
  } else {
    console.error("Failed to delete history record.");
  }
}

export async function deleteNote(athleteId, noteId) {
  const response = await fetch(`/api/athletes/${athleteId}/notes/${noteId}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  });

  if (response.ok) {
    showModal("Note deleted successfully.");
    reloadPage();
  } else {
    console.error("Failed to delete note.");
  }
}

export async function deleteSupplement(athleteId, noteId) {
  const response = await fetch(
    `/api/athletes/${athleteId}/supplements/${noteId}`,
    {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    }
  );

  if (response.ok) {
    showModal("Supplement note deleted successfully.");
    reloadPage();
  } else {
    console.error("Failed to delete supplement note.");
  }
}

export async function deleteAppointment(athleteId, appointmentId) {
  const response = await fetch(
    `/api/athletes/${athleteId}/appointments/${appointmentId}`,
    {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    }
  );

  if (response.ok) {
    showModal("Appointment deleted successfully.");
    reloadPage();
  } else {
    console.error("Failed to delete appointment.");
  }
}

export async function saveNote(athleteId, note) {
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

export async function saveSupplement(athleteId, note) {
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

export async function saveAppointment(athleteId, date, tournamentName) {
  console.log("Saving appointment:", date, tournamentName);
  const response = await fetch(`/api/athletes/${athleteId}/appointments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ date, tournamentName }),
  });
  console.log("Appointment response status:", response.status);
}

export async function addNote(athleteId, note) {
  console.log("Adding note:", note);
  const response = await fetch(`/api/athletes/${athleteId}/notes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ note }),
  });
  if (response.ok) {
    console.log("Note added successfully");
    await fetchAthleteDetails(athleteId);
  } else {
    console.error("Failed to add note.");
  }
}

export async function addSupplement(athleteId, note) {
  console.log("Adding supplement note:", note);
  const response = await fetch(`/api/athletes/${athleteId}/supplements`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ note }),
  });
  if (response.ok) {
    console.log("Supplement note added successfully");
    await fetchAthleteDetails(athleteId);
  } else {
    console.error("Failed to add supplement note.");
  }
}

export async function addTournament(athleteId, tournament) {
  console.log("Adding tournament:", tournament);
  const response = await fetch(`/api/athletes/${athleteId}/tournaments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tournament }),
  });
  if (response.ok) {
    console.log("Tournament added successfully");
    await fetchAthleteDetails(athleteId);
  } else {
    console.error("Failed to add tournament.");
  }
}

export async function saveTableData(athleteId, tableData) {
  if (!athleteId || !tableData) {
    console.error("Athlete ID or Table Data is undefined.");
    return;
  }

  console.log("Saving table data for Athlete ID:", athleteId); // Log athlete ID when saving table data
  console.log("Table data:", tableData); // Log the actual table data

  const response = await fetch(`/api/athletes/${athleteId}/custom-table`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tableData }),
  });
  if (response.ok) {
    console.log("Table data saved successfully");
  } else {
    console.error("Failed to save table data.");
  }
}

export async function loadTableData(athleteId) {
  try {
    const res = await fetch(`/api/athletes/${athleteId}/custom-table`);
    const tableData = await res.json();
    console.log("Table data loaded successfully");
    // Implement logic to display table data
  } catch (error) {
    console.error("Error loading table data:", error);
  }
}

export function showEditModal() {
  console.log("Showing edit modal");
  // Implement the modal display logic here
}

export function reloadPage() {
  location.reload();
}

export async function loadAdditionalInfo(athleteId, athlete) {
  const currentWeightElement = document.getElementById("current-weight");
  if (currentWeightElement) {
    currentWeightElement.value = athlete.currentWeight || "";
  }

  const fatsPercentageElement = document.getElementById("fats-percentage");
  if (fatsPercentageElement) {
    fatsPercentageElement.value = athlete.fatsPercentage || "";
  }

  const musclePercentageElement = document.getElementById("muscle-percentage");
  if (musclePercentageElement) {
    musclePercentageElement.value = athlete.musclePercentage || "";
  }

  const historyListElement = document.getElementById("history-list");
  if (historyListElement) {
    historyListElement.innerHTML = "";
    if (athlete.history && athlete.history.length > 0) {
      athlete.history.forEach((record) => {
        const listItem = document.createElement("li");
        listItem.innerHTML = `Date: ${record.date}, Weight: ${record.weight} kg, Fats: ${record.fats} %, Muscle: ${record.muscle} %
          <button class="delete-button" data-athlete-id="${athleteId}" data-record-id="${record._id}">Delete</button>`;
        historyListElement.appendChild(listItem);
      });
    } else {
      const noHistoryMessage = document.createElement("p");
      noHistoryMessage.textContent = "No historical data available.";
      historyListElement.appendChild(noHistoryMessage);
    }
  }
}

export async function populateNotes(athleteId, notes) {
  const section = document.getElementById("notes-content");
  if (notes && notes.length > 0) {
    section.innerHTML = notes
      .map(
        (note) =>
          `<p>${note.date}: <strong>${note.note}</strong> <span class="note-actions"><button class="delete-button" data-athlete-id="${athleteId}" data-note-id="${note._id}">Delete</button> <button class="edit-button" data-athlete-id="${athleteId}" data-note-id="${note._id}">Edit</button></span></p>`
      )
      .join("");
  } else {
    section.innerHTML = "<p>No notes yet.</p>";
  }
}

export async function populateSupplements(athleteId, supplements) {
  const section = document.getElementById("supplements-content");
  if (supplements && supplements.length > 0) {
    section.innerHTML = supplements
      .map(
        (note) =>
          `<p>${note.date}: <strong>${note.note}</strong> <span class="note-actions"><button class="delete-button" data-athlete-id="${athleteId}" data-note-id="${note._id}">Delete</button> <button class="edit-button" data-athlete-id="${athleteId}" data-note-id="${note._id}">Edit</button></span></p>`
      )
      .join("");
  } else {
    section.innerHTML = "<p>No supplement notes yet.</p>";
  }
}

export async function populateAppointments(athleteId, appointments) {
  const section = document.getElementById("appointments-content");
  if (appointments && appointments.length > 0) {
    section.innerHTML = appointments
      .map(
        (appointment) =>
          `<p>${appointment.date} - ${appointment.tournamentName} <button class="delete-button" data-athlete-id="${athleteId}" data-appointment-id="${appointment._id}">Delete</button></p>`
      )
      .join("");
  } else {
    section.innerHTML = "<p>No appointments yet.</p>";
  }
}
