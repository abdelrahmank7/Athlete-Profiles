const { contextBridge, ipcRenderer, remote } = require("electron");

contextBridge.exposeInMainWorld("electron", {
  ipcRenderer: {
    send: (channel, data) => {
      let validChannels = ["toMain"];
      if (validChannels.includes(channel)) {
        ipcRenderer.send(channel, data);
      }
    },
    receive: (channel, func) => {
      let validChannels = ["fromMain"];
      if (validChannels.includes(channel)) {
        ipcRenderer.on(channel, (event, ...args) => func(...args));
      }
    },
  },
  windowControls: {
    minimize: () => remote.getCurrentWindow().minimize(),
    maximize: () => {
      const win = remote.getCurrentWindow();
      win.isMaximized() ? win.unmaximize() : win.maximize();
    },
    close: () => remote.getCurrentWindow().close(),
  },
});
