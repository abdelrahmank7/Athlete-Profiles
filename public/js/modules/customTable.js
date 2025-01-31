// Debounce function to limit rapid saves
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
};

// Function to load the custom table data from the server
export async function loadCustomTableFromServer(athleteId) {
  try {
    const res = await fetch(`/api/athletes/${athleteId}/custom-table`);
    if (!res.ok) {
      throw new Error("Failed to fetch custom table data");
    }
    const { customTable } = await res.json();
    console.log("Loaded customTable data:", customTable);

    const customTableElement = document.getElementById("custom-table");
    customTableElement.innerHTML = ""; // Clear existing table data
    customTable.forEach((row, rowIndex) => {
      const newRow = customTableElement.insertRow();
      newRow.setAttribute("data-row-index", rowIndex); // Set the data-row-index attribute
      row.forEach((cellData) => {
        const newCell = newRow.insertCell();
        newCell.contentEditable = "true";
        newCell.textContent = cellData;
      });
      // Debounced save on cell edit
      newRow.addEventListener(
        "input",
        debounce(() => {
          saveRowToServer(athleteId, newRow);
        }, 500)
      );
    });
  } catch (error) {
    console.error("Error loading custom table data:", error);
  }
}

// Function to add a new row to the table and server
export async function addRowToTable(athleteId) {
  const customTable = document.getElementById("custom-table");
  const newRow = customTable.insertRow();

  for (let i = 0; i < 4; i++) {
    const newCell = newRow.insertCell();
    newCell.contentEditable = "true";
    newCell.textContent = "";
  }

  const rowData = Array.from(newRow.cells).map((cell) =>
    cell.textContent.trim()
  );
  try {
    const response = await fetch(
      `/api/athletes/${athleteId}/custom-table/row`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rowData }),
      }
    );
    if (!response.ok) {
      throw new Error("Failed to add new row");
    }
    const result = await response.json();
    newRow.setAttribute("data-row-index", result.rowIndex);
    alert("New row added successfully.");
  } catch (error) {
    console.error("Error adding new row:", error);
    alert("Failed to add new row.");
  }
}

// Function to save a specific row to the server
export async function saveRowToServer(athleteId, rowElement) {
  const rowIndex = rowElement.getAttribute("data-row-index");
  const rowData = Array.from(rowElement.cells).map((cell) =>
    cell.textContent.trim()
  );

  try {
    const response = await fetch(
      `/api/athletes/${athleteId}/custom-table/row/${rowIndex}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rowData }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log("Response from save row:", result);
    alert("Row data saved successfully.");
  } catch (error) {
    console.error("Error saving row data:", error);
    alert("Failed to save row data.");
  }
}

// Function to save all rows
export async function saveAllRows(athleteId) {
  const customTable = document.getElementById("custom-table");
  for (let i = 0; i < customTable.rows.length; i++) {
    const rowElement = customTable.rows[i];
    await saveRowToServer(athleteId, rowElement);
  }
  alert("All rows saved successfully.");
}

// Add row button handler
document
  .getElementById("add-row-button")
  .addEventListener("click", async () => {
    const athleteId = document.getElementById("athlete-id").value;
    await addRowToTable(athleteId);
  });

// Save all rows button handler
document
  .getElementById("save-all-button")
  .addEventListener("click", async () => {
    const athleteId = document.getElementById("athlete-id").value;
    await saveAllRows(athleteId);
  });

// Initialize custom table functionality
export function initializeCustomTable(athleteId) {
  loadCustomTableFromServer(athleteId);
}
