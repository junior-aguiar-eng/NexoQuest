import { spawn } from "node:child_process";
import { join } from "node:path";

const serverPath = join(process.cwd(), "dist", "server", "stdio.js");

const proc = spawn("node", [serverPath], {
  stdio: ["pipe", "pipe", "inherit"],
});

let buffer = "";

proc.stdout.on("data", (data) => {
  buffer += data.toString();
  console.log("[MCP OUTPUT RAW]:", data.toString());
});

function send(obj: any) {
  const msg = JSON.stringify(obj) + "\n";
  console.log("[SENDING]:", msg.trim());
  proc.stdin.write(msg);
}

// 1. Initialize
send({
  jsonrpc: "2.0",
  id: 1,
  method: "initialize",
  params: {
    protocolVersion: "2024-11-05",
    capabilities: {},
    clientInfo: { name: "AntigravityTest", version: "1.0.0" },
  },
});

setTimeout(() => {
  send({
    jsonrpc: "2.0",
    method: "notifications/initialized",
  });
}, 500);

setTimeout(() => {
  send({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/list",
    params: {},
  });
}, 1000);

setTimeout(() => {
  send({
    jsonrpc: "2.0",
    id: 3,
    method: "resources/list",
    params: {},
  });
}, 1500);

setTimeout(() => {
  send({
    jsonrpc: "2.0",
    id: 4,
    method: "prompts/list",
    params: {},
  });
}, 2000);

setTimeout(() => {
  proc.kill();
  process.exit(0);
}, 3000);
