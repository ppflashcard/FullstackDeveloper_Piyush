import { rmSync } from "node:fs";
import { createConnection } from "node:net";

const DEV_PORTS = [3000, 3001];

function isDevServerRunning(port) {
  return new Promise((resolve) => {
    const socket = createConnection({ port, host: "127.0.0.1" });

    const finish = (running) => {
      socket.destroy();
      resolve(running);
    };

    socket.setTimeout(500);
    socket.on("connect", () => finish(true));
    socket.on("timeout", () => finish(false));
    socket.on("error", () => finish(false));
  });
}

for (const port of DEV_PORTS) {
  if (await isDevServerRunning(port)) {
    console.error(`\nBuild blocked: dev server is running on port ${port}.`);
    console.error('Stop "npm run dev" before running "npm run build".\n');
    process.exit(1);
  }
}

rmSync(".next", { recursive: true, force: true });
