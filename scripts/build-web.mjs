import { copyFile, mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const project = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const files = ['index.html', 'styles.css', 'renderer.js', 'preparation.js', 'assets/icon.png', 'assets/icon.ico'];

export async function buildWeb() {
  const directory = path.join(project, 'dist');
  await mkdir(path.join(directory, 'assets'), { recursive: true });
  for (const file of files) {
    await copyFile(path.join(project, 'apps', 'web', file), path.join(directory, file));
  }
  const metadata = JSON.parse(await readFile(path.join(project, 'presentations', 'drepanocytose', 'metadata.json'), 'utf8'));
  if (typeof metadata.title !== 'string' || !metadata.title.trim()) throw new Error('Presentation title is missing.');
  await writeFile(path.join(directory, 'presentation.json'), `${JSON.stringify(metadata, null, 2)}\n`);
  const outputFiles = [...files, 'presentation.json'];
  const totalBytes = (await Promise.all(outputFiles.map(file => stat(path.join(directory, file))))).reduce((sum, file) => sum + file.size, 0);
  return { directory, files: outputFiles, totalBytes };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  console.log(JSON.stringify(await buildWeb(), null, 2));
}
