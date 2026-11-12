const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'diapo-check-'));
const output = path.join(directory, 'report.json');
const parameters = process.argv.slice(2);
const suppliedExecutable = parameters.find(argument => !argument.startsWith('--'));
const executable = suppliedExecutable || require('electron');
const args = suppliedExecutable ? [] : [path.resolve(__dirname, '..')];
args.push(`--diagnostics-output=${output}`);
if (parameters.includes('--capture-loading')) args.push('--capture-loading');
const env = { ...process.env };
delete env.ELECTRON_RUN_AS_NODE;
delete env.NODE_OPTIONS;
delete env.NODE_PATH;
if (suppliedExecutable && process.platform === 'win32') {
  // A packaged app must not find Node, npm or another developer runtime on PATH.
  env.PATH = `${process.env.SystemRoot}\\System32;${process.env.SystemRoot}`;
  args.push(`--user-data-dir=${path.join(directory, 'profile')}`);
}
const result = spawnSync(executable, args, { env, timeout: 90000, windowsHide: true, encoding: 'utf8' });
if (result.error) throw result.error;
if (!fs.existsSync(output)) {
  console.error(result.stderr || result.stdout || 'Desktop process did not produce its diagnostic report.');
  process.exitCode = 1;
} else {
  const report = JSON.parse(fs.readFileSync(output, 'utf8'));
  console.log(JSON.stringify(report, null, 2));
  console.log(`Diagnostic report: ${output}`);
  if (!report.passed || result.status !== 0) process.exitCode = 1;
}
