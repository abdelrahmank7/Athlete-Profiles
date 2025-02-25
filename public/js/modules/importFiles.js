export function setupFileUpload(athleteId) {
  const uploadButton = document.getElementById("upload-button");
  const fileInput = document.getElementById("file-input");
  const filesList = document.getElementById("files-list");

  uploadButton.addEventListener("click", async () => {
    const files = fileInput.files;
    if (files.length === 0) {
      alert("Please select files to upload.");
      return;
    }

    const formData = new FormData();
    for (const file of files) {
      formData.append("files", file);
    }

    try {
      const response = await fetch(`/api/athletes/${athleteId}/files`, {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      if (response.ok) {
        alert("Files uploaded successfully.");
        displayUploadedFiles(result.files);
      } else {
        alert("Failed to upload files: " + result.error);
      }
    } catch (error) {
      console.error("Error uploading files:", error);
      alert("Error uploading files.");
    }
  });
  async function fetchUploadedFiles() {
    try {
      const response = await fetch(`/api/athletes/${athleteId}/files`);
      const result = await response.json();
      if (response.ok) {
        displayUploadedFiles(result.files);
      } else {
        console.error("Failed to fetch files: " + result.error);
      }
    } catch (error) {
      console.error("Error fetching files:", error);
    }
  }
  function displayUploadedFiles(files) {
    filesList.innerHTML = "";
    files.forEach((file) => {
      const fileElement = document.createElement("div");
      if (
        file.name.endsWith(".jpg") ||
        file.name.endsWith(".jpeg") ||
        file.name.endsWith(".png") ||
        file.name.endsWith(".gif") ||
        file.name.endsWith(".tiff") ||
        file.name.endsWith(".psd") ||
        file.name.endsWith(".raw")
      ) {
        fileElement.innerHTML = `<a href="${file.path}" target="_blank">${file.name}</a>`;
      } else {
        fileElement.innerHTML = `<a href="${file.path}" download>${file.name}</a>`;
      }
      filesList.appendChild(fileElement);
    });
  }

  // Fetch and display uploaded files when the page loads
  fetchUploadedFiles();
}
