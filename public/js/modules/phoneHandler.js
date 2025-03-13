// Function to validate phone numbers
export function validatePhoneNumber(phoneNumber) {
  const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/;
  return phoneRegex.test(phoneNumber);
}

// Function to format phone numbers (optional)
export function formatPhoneNumber(phoneNumber) {
  const numericOnly = phoneNumber.replace(/\D/g, "");

  if (numericOnly.length === 10) {
    return `(${numericOnly.slice(0, 3)}) ${numericOnly.slice(
      3,
      6
    )}-${numericOnly.slice(6)}`;
  }

  return phoneNumber;
}

// Function to fetch and display phone numbers from the backend
export async function fetchPhoneNumbers(athleteId) {
  try {
    const response = await fetch(`/api/athletes/athlete-contacts/${athleteId}`);
    if (!response.ok) {
      throw new Error("Failed to fetch phone numbers.");
    }
    const phoneNumbers = await response.json();
    return phoneNumbers;
  } catch (error) {
    console.error("Error fetching phone numbers:", error);
    return [];
  }
}

// Function to save a phone number to the backend
export async function savePhoneNumber(athleteId, phoneNumber) {
  try {
    const response = await fetch("/api/athletes/athlete-contacts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ athleteId, phoneNumber }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to save phone number.");
    }

    return true; // Success
  } catch (error) {
    console.error("Error saving phone number:", error);
    return false; // Failure
  }
}
