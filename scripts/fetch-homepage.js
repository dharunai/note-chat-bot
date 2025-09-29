import { spawn } from 'child_process';
import http from 'http';

const devProcess = spawn('npm', ['run', 'dev'], {
  cwd: process.cwd(),
  shell: true,
  env: { ...process.env },
});

devProcess.stdout.setEncoding('utf8');
devProcess.stderr.setEncoding('utf8');

const chunks = [];
const modules = new Map();

const cleanup = () => {
  if (!devProcess.killed) {
    devProcess.kill('SIGINT');
  }
};

const waitForServer = () =>
  new Promise((resolve, reject) => {
    devProcess.stdout.on('data', (data) => {
      process.stdout.write(data);
      if (data.includes('Server running')) {
        resolve();
      }
    });

    devProcess.stderr.on('data', (data) => {
      process.stderr.write(data);
    });

    devProcess.on('error', reject);
    devProcess.on('exit', (code) => {
      if (code !== 0) {
        reject(new Error(`Dev server exited with code ${code}`));
      }
    });
  });

const fetchResource = (url) =>
  new Promise((resolve, reject) => {
    http.get(url, (res) => {
      res.setEncoding('utf8');
      const buffer = [];
      res.on('data', (chunk) => buffer.push(chunk));
      res.on('end', resolve);
      res.on('close', resolve);
      res.on('error', reject);

      res.on('end', () => {
        modules.set(url, buffer.join(''));
      });
    }).on('error', reject);
  });

try {
  await waitForServer();
  await new Promise((resolve) => setTimeout(resolve, 2000));
  const baseUrl = 'http://127.0.0.1:5000';
  await fetchResource(baseUrl);
  await fetchResource(`${baseUrl}/src/main.tsx`);
  await fetchResource(`${baseUrl}/src/App.tsx`);
  console.log('\n--- Homepage HTML ---\n');
  console.log(modules.get(baseUrl));
  console.log('\n--- main.tsx ---\n');
  console.log(modules.get(`${baseUrl}/src/main.tsx`));
  console.log('\n--- App.tsx ---\n');
  console.log(modules.get(`${baseUrl}/src/App.tsx`));
} catch (error) {
  console.error('Failed to fetch homepage:', error);
} finally {
  cleanup();
}
