import { app, BrowserWindow } from "electron";
import { join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: join(__dirname, "preload.cjs"),
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  // Load the application from http://localhost:3000 instead of a local file
  mainWindow.loadURL("http://localhost:3000");

  // Disable DevTools
  mainWindow.webContents.on("did-frame-finish-load", () => {
    mainWindow.webContents.closeDevTools();
  });
}

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
