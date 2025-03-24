export async function fetchSystems() {
  const res = await fetch("/systems/systems");
  if (!res.ok) {
    throw new Error("Failed to fetch systems");
  }
  return res.json();
}

export async function fetchAthletes() {
  const res = await fetch("/api/athletes");
  return res.json();
}

export async function assignSystem(athleteId, systemId) {
  const res = await fetch(`/systems/athletes/${athleteId}/system`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ systemId }),
  });
  if (!res.ok) {
    throw new Error("Failed to assign system");
  }
}
export async function generateWordFile(athleteId, systemId, sport) {
  const res = await fetch(`/systems/athletes/${athleteId}/generate-word`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ systemId, sport }),
  });

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${athleteId}.docx`;
  a.click();
}
export async function updateSystem(athleteId, systemId) {
  await fetch(`/systems/athletes/${athleteId}/system`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ systemId }),
  });
}

export async function fetchAssignedSystem(athleteId) {
  const res = await fetch(`/systems/athletes/${athleteId}/assigned-system`);
  return res.json();
}
