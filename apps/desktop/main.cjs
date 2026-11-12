const { app, BrowserWindow, Menu, nativeTheme, session } = require('electron');
const path = require('node:path');
const fs = require('node:fs');

const title = 'Diapo Engine';
const icon = path.join(__dirname, 'assets', 'icon.ico');
const diagnosticsPath = app.commandLine.getSwitchValue('diagnostics-output');
let mainWindow;

async function checkWindow(window) {
  const page = await window.webContents.executeJavaScript(`({
    background: getComputedStyle(document.body).backgroundColor,
    text: document.body.innerText,
    children: document.body.children.length,
    scrollWidth: document.documentElement.scrollWidth,
    width: innerWidth,
    scrollHeight: document.documentElement.scrollHeight,
    height: innerHeight
  })`);
  const bitmap = await window.webContents.capturePage();
  const pixels = bitmap.toBitmap();
  let allPixelsWhite = pixels.length > 0;
  for (let i = 0; i < pixels.length; i += 4) {
    if (pixels[i] !== 255 || pixels[i + 1] !== 255 || pixels[i + 2] !== 255 || pixels[i + 3] !== 255) {
      allPixelsWhite = false;
      break;
    }
  }
  const report = {
    packaged: app.isPackaged,
    platform: process.platform,
    architecture: process.arch,
    version: app.getVersion(),
    title: window.getTitle(),
    menuRemoved: Menu.getApplicationMenu() === null,
    resizable: window.isResizable(),
    maximizable: window.isMaximizable(),
    minimizable: window.isMinimizable(),
    iconPresent: fs.existsSync(icon),
    allPixelsWhite,
    page,
  };
  report.passed = report.title === title && report.menuRemoved && report.resizable && report.maximizable &&
    report.minimizable && report.iconPresent && report.allPixelsWhite && page.text === '' &&
    page.children === 0 && page.scrollWidth === page.width && page.scrollHeight === page.height;
  fs.writeFileSync(diagnosticsPath, `${JSON.stringify(report, null, 2)}\n`);
  app.exit(report.passed ? 0 : 1);
}

app.whenReady().then(() => {
  nativeTheme.themeSource = 'light';
  Menu.setApplicationMenu(null);
  session.defaultSession.setPermissionRequestHandler((_contents, _permission, callback) => callback(false));
  session.defaultSession.webRequest.onBeforeRequest(
    { urls: ['http://*/*', 'https://*/*', 'ws://*/*', 'wss://*/*'] },
    (_details, callback) => callback({ cancel: true }),
  );
  mainWindow = new BrowserWindow({
    title,
    icon,
    width: 1120,
    height: 760,
    minWidth: 330,
    minHeight: 220,
    center: true,
    show: false,
    backgroundColor: '#ffffff',
    backgroundMaterial: 'none',
    accentColor: false,
    frame: true,
    roundedCorners: true,
    resizable: true,
    maximizable: true,
    minimizable: true,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      spellcheck: false,
      devTools: !app.isPackaged,
    },
  });
  mainWindow.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  mainWindow.webContents.on('will-navigate', event => event.preventDefault());
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    if (diagnosticsPath) {
      checkWindow(mainWindow).catch(error => {
        fs.writeFileSync(diagnosticsPath, JSON.stringify({ passed: false, error: error.message }));
        app.exit(1);
      });
    }
  });
  mainWindow.loadFile(path.join(__dirname, 'index.html'));
});

app.on('window-all-closed', () => app.quit());
