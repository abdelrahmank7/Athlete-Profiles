// Fetch and Save Data
export async function fetchAthleteDetails(athleteId) {
  console.log("Fetching details for Athlete ID:", athleteId);

  try {
    const res = await fetch(`/api/athletes/${athleteId}`);
    if (!res.ok) {
      throw new Error("Athlete not found");
    }
    const athlete = await res.json();

    if (!athlete) {
      console.error("No athlete data received");
      document.body.innerHTML =
        '<h1>Athlete not found. Please return to <a href="/">Home</a></h1>';
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

    window.currentAthleteID = athlete.id;
    console.log("Set window.currentAthleteID to:", athlete.id);

    await loadAdditionalInfo(athlete.id, athlete);
    await populateNotes(athlete.id, athlete.notes);
    await populateSupplements(athlete.id, athlete.supplementNotes);
    await populateAppointments(athlete.id, athlete.appointments);
  } catch (error) {
    console.error("Error fetching athlete details:", error);
    document.body.innerHTML =
      '<h1>Athlete not found. Please return to <a href="/">Home</a></h1>';
    return null;
  }
}

export async function saveTableData(athleteId, tableData) {
  if (!athleteId || !tableData) {
    console.error("Athlete ID or Table Data is undefined.");
    return;
  }

  console.log("Saving table data for Athlete ID:", athleteId);
  console.log("Table data:", tableData);

  try {
    const response = await fetch(`/api/athletes/${athleteId}/custom-table`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tableData }),
    });

    if (response.ok) {
      console.log("Table data saved successfully");
    } else {
      const errorText = await response.text();
      console.error(
        "Failed to save table data. Status code:",
        response.status,
        "Response:",
        errorText
      );
    }
  } catch (error) {
    console.error("Error saving table data:", error);
  }
}

// Load and Populate Data
export async function loadTableData(athleteId) {
  try {
    const res = await fetch(`/api/athletes/${athleteId}/custom-table`);
    if (!res.ok) {
      throw new Error(`Failed to load table data: ${res.statusText}`);
    }
    const tableData = await res.json();
    console.log("Table data loaded successfully");
    populateTableData(tableData);
  } catch (error) {
    console.error("Error loading table data:", error);
  }
}

function populateTableData(tableData) {
  const table = document.getElementById("custom-table");
  if (tableData && table) {
    table.innerHTML = ""; // Clear existing table data
    tableData.forEach((rowData) => {
      const row = table.insertRow();
      rowData.forEach((cellData) => {
        const cell = row.insertCell();
        cell.textContent = cellData;
        cell.contentEditable = "true";
      });
    });
  }
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
        listItem.textContent = `Date: ${record.date}, Weight: ${record.weight}`;
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.className = "delete-button";
        deleteButton.dataset.athleteId = athleteId;
        deleteButton.dataset.recordId = record.id;
        listItem.appendChild(deleteButton);
        historyListElement.appendChild(listItem);
      });
    } else {
      historyListElement.innerHTML = "<li>No history records found.</li>";
    }
  }
}

export async function populateNotes(athleteId, notes) {
  const notesContentElement = document.getElementById("notes-content");
  if (notesContentElement) {
    notesContentElement.innerHTML = "";
    if (notes && notes.length > 0) {
      notes.forEach((note) => {
        const noteItem = document.createElement("div");
        noteItem.textContent = note.text;
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.className = "delete-button";
        deleteButton.dataset.athleteId = athleteId;
        deleteButton.dataset.noteId = note.id;
        noteItem.appendChild(deleteButton);
        notesContentElement.appendChild(noteItem);
      });
    } else {
      notesContentElement.innerHTML = "<p>No notes found.</p>";
    }
  }
}

export async function populateSupplements(athleteId, supplements) {
  const supplementsContentElement = document.getElementById(
    "supplements-content"
  );
  if (supplementsContentElement) {
    supplementsContentElement.innerHTML = "";
    if (supplements && supplements.length > 0) {
      supplements.forEach((supplement) => {
        const supplementItem = document.createElement("div");
        supplementItem.textContent = supplement.name;
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.className = "delete-button";
        deleteButton.dataset.athleteId = athleteId;
        deleteButton.dataset.noteId = supplement.id;
        supplementItem.appendChild(deleteButton);
        supplementsContentElement.appendChild(supplementItem);
      });
    } else {
      supplementsContentElement.innerHTML = "<p>No supplements found.</p>";
    }
  }
}

export async function populateAppointments(athleteId, appointments) {
  const appointmentsContentElement = document.getElementById(
    "appointments-content"
  );
  if (appointmentsContentElement) {
    appointmentsContentElement.innerHTML = "";
    if (appointments && appointments.length > 0) {
      appointments.forEach((appointment) => {
        const appointmentItem = document.createElement("div");
        appointmentItem.textContent = `Date: ${appointment.date}, Event: ${appointment.event}`;
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.className = "delete-button";
        deleteButton.dataset.athleteId = athleteId;
        deleteButton.dataset.appointmentId = appointment.id;
        appointmentItem.appendChild(deleteButton);
        appointmentsContentElement.appendChild(appointmentItem);
      });
    } else {
      appointmentsContentElement.innerHTML = "<p>No appointments found.</p>";
    }
  }
}

// Delete Functions
export async function deleteHistoryRecord(athleteId, recordId) {
  try {
    const response = await fetch(
      `/api/athletes/${athleteId}/history/${recordId}`,
      {
        method: "DELETE",
      }
    );
    if (response.ok) {
      console.log("History record deleted successfully");
      // Optionally, refresh the history list
      await loadAdditionalInfo(athleteId);
    } else {
      console.error("Failed to delete history record");
    }
  } catch (error) {
    console.error("Error deleting history record:", error);
  }
}

export async function deleteNote(athleteId, noteId) {
  try {
    const response = await fetch(`/api/athletes/${athleteId}/notes/${noteId}`, {
      method: "DELETE",
    });
    if (response.ok) {
      console.log("Note deleted successfully");
      // Optionally, refresh the notes list
      await populateNotes(athleteId);
    } else {
      console.error("Failed to delete note");
    }
  } catch (error) {
    console.error("Error deleting note:", error);
  }
}

export async function deleteSupplement(athleteId, supplementId) {
  try {
    const response = await fetch(
      `/api/athletes/${athleteId}/supplements/${supplementId}`,
      {
        method: "DELETE",
      }
    );
    if (response.ok) {
      console.log("Supplement deleted successfully");
      // Optionally, refresh the supplements list
      await populateSupplements(athleteId);
    } else {
      console.error("Failed to delete supplement");
    }
  } catch (error) {
    console.error("Error deleting supplement:", error);
  }
}

export async function deleteAppointment(athleteId, appointmentId) {
  try {
    const response = await fetch(
      `/api/athletes/${athleteId}/appointments/${appointmentId}`,
      {
        method: "DELETE",
      }
    );
    if (response.ok) {
      console.log("Appointment deleted successfully");
      // Optionally, refresh the appointments list
      await populateAppointments(athleteId);
    } else {
      console.error("Failed to delete appointment");
    }
  } catch (error) {
    console.error("Error deleting appointment:", error);
  }
}
