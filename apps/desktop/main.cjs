const { app, BrowserWindow, Menu, nativeTheme, session, ipcMain } = require('electron');
const path = require('node:path');
const fs = require('node:fs');

const metadata = require('../../presentations/drepanocytose/metadata.json');
const title = metadata.title;
const loadingDurationMs = 1000;
const icon = path.join(__dirname, 'assets', 'icon.ico');
const diagnosticsPath = app.commandLine.getSwitchValue('diagnostics-output');
app.setName(title);
let mainWindow;

function waitForMark(window, name) {
  return window.webContents.executeJavaScript(`new Promise((resolve, reject) => {
    const name = ${JSON.stringify(name)};
    if (performance.getEntriesByName(name, 'mark').length) return resolve();
    const observer = new PerformanceObserver(() => {
      if (performance.getEntriesByName(name, 'mark').length) {
        clearTimeout(timeout);
        observer.disconnect();
        resolve();
      }
    });
    const timeout = setTimeout(() => { observer.disconnect(); reject(new Error('Startup phase timed out: ' + name)); }, 10000);
    observer.observe({ entryTypes: ['mark'] });
  })`);
}

function readPage(window) {
  return window.webContents.executeJavaScript(`({
    screen: document.body.dataset.screen,
    title: document.title,
    background: getComputedStyle(document.body).backgroundColor,
    text: document.body.innerText,
    loadingHidden: document.getElementById('loading').hidden,
    bloodCellCount: document.querySelectorAll('#loading .blood-cell').length,
    normalCellCount: document.querySelectorAll('#loading .blood-cell[data-kind="normal"]').length,
    sickleCellCount: document.querySelectorAll('#loading .blood-cell[data-kind="sickle"]').length,
    imagesReady: [...document.querySelectorAll('#loading img')].every(image => image.complete && image.naturalWidth > 0),
    motionStarted: document.body.dataset.motion === 'running',
    activeAnimationCount: document.getAnimations().filter(animation => animation.playState === 'running').length,
    presentationHidden: document.getElementById('presentation').hidden,
    presentationChildren: document.getElementById('presentation').children.length,
    scrollWidth: document.documentElement.scrollWidth,
    width: innerWidth,
    scrollHeight: document.documentElement.scrollHeight,
    height: innerHeight,
    hasNodeGlobals: typeof require !== 'undefined' || typeof process !== 'undefined',
    loadingDurationMs: performance.getEntriesByName('visible-loading', 'measure')[0]?.duration ?? null,
    animation: performance.getEntriesByName('loading-animation', 'measure')[0]?.detail ?? null,
    preparation: performance.getEntriesByName('resource-preparation', 'measure')[0]?.detail ?? null
  })`);
}

function memorySnapshot() {
  const metrics = app.getAppMetrics();
  const mib = value => Math.round(value / 1024 * 10) / 10;
  return {
    processCount: metrics.length,
    totalWorkingSetMiB: mib(metrics.reduce((total, process) => total + process.memory.workingSetSize, 0)),
    totalPrivateCommittedMiB: mib(metrics.reduce((total, process) => total + (process.memory.privateBytes ?? 0), 0)),
  };
}

async function checkWindow(window) {
  await waitForMark(window, 'loading-visible');
  const loading = await readPage(window);
  const loadingMemory = memorySnapshot();
  if (app.commandLine.hasSwitch('capture-loading')) {
    // Keep screenshots out of normal cadence measurements: PNG encoding can
    // perturb a one-second animation on a modest computer.
    const loadingImage = await window.webContents.capturePage();
    fs.writeFileSync(path.join(path.dirname(diagnosticsPath), 'loading.png'), loadingImage.toPNG());
  }
  await waitForMark(window, 'normal-visible');
  const page = await readPage(window);
  const normalMemory = memorySnapshot();
  const bitmap = await window.webContents.capturePage();
  fs.writeFileSync(path.join(path.dirname(diagnosticsPath), 'normal.png'), bitmap.toPNG());
  const pixels = bitmap.toBitmap();
  let allPixelsBlack = pixels.length > 0;
  for (let i = 0; i < pixels.length; i += 4) {
    if (pixels[i] !== 0 || pixels[i + 1] !== 0 || pixels[i + 2] !== 0 || pixels[i + 3] !== 255) {
      allPixelsBlack = false;
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
    loading,
    memory: { loading: loadingMemory, normal: normalMemory },
    allPixelsBlack,
    page,
  };
  report.passed = report.title === title && report.menuRemoved && report.resizable && report.maximizable &&
    report.minimizable && report.iconPresent && loading.screen === 'loading' && !loading.loadingHidden &&
    loading.background === 'rgb(255, 255, 255)' && loading.bloodCellCount >= 3 && loading.normalCellCount >= 1 &&
    loading.sickleCellCount >= 1 && loading.imagesReady && loading.motionStarted && loading.presentationHidden &&
    loading.text.trim() === 'Chargement…' && loading.activeAnimationCount >= 1 &&
    page.screen === 'normal' && page.title === title && page.loadingHidden && !page.presentationHidden &&
    page.background === 'rgb(0, 0, 0)' && report.allPixelsBlack && page.text === '' &&
    page.presentationChildren === 0 && page.scrollWidth === page.width && page.scrollHeight === page.height &&
    !page.hasNodeGlobals && page.activeAnimationCount === 0 && page.loadingDurationMs >= loadingDurationMs &&
    page.preparation?.completed.includes('intro-images') && page.preparation?.completed.includes('fonts');
  fs.writeFileSync(diagnosticsPath, `${JSON.stringify(report, null, 2)}\n`);
  app.exit(report.passed ? 0 : 1);
}

app.whenReady().then(() => {
  if (process.platform === 'win32') app.setAppUserModelId('io.github.ibrahimbouillet.drepanocytose');
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
      preload: path.join(__dirname, 'preload.cjs'),
      spellcheck: false,
      devTools: !app.isPackaged,
    },
  });
  ipcMain.handle('presentation:when-shown', event => {
    const window = mainWindow;
    if (event.sender !== window.webContents || event.senderFrame !== window.webContents.mainFrame) {
      throw new Error('Bootstrap is available only to the presentation window.');
    }
    const configuration = { ...metadata, loadingDurationMs };
    if (window.isVisible()) return configuration;
    return new Promise((resolve, reject) => {
      const onShow = () => { window.off('closed', onClose); resolve(configuration); };
      const onClose = () => { window.off('show', onShow); reject(new Error('Presentation window closed before showing.')); };
      window.once('show', onShow);
      window.once('closed', onClose);
    });
  });
  // The native title always names this presentation, even before bootstrap.
  mainWindow.on('page-title-updated', event => event.preventDefault());
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
