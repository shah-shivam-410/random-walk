import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { CopilotClient } from "@github/copilot-sdk";

const root = fileURLToPath(new URL(".", import.meta.url));
const publicDirectory = join(root, "public");
const port = Number(process.env.PORT ?? 3000);
const assets = new Map([
  ["/", ["index.html", "text/html; charset=utf-8"]],
  ["/styles.css", ["styles.css", "text/css; charset=utf-8"]],
  ["/app.js", ["app.js", "text/javascript; charset=utf-8"]],
  ["/waypoint.js", ["waypoint.js", "text/javascript; charset=utf-8"]],
]);

async function readJson(request) {
  let body = "";
  for await (const chunk of request) {
    body += chunk;
    if (body.length > 2048) {
      const error = new Error("Request body is too large.");
      error.statusCode = 413;
      throw error;
    }
  }
  return JSON.parse(body);
}

async function generateMission(duration) {
  const client = new CopilotClient();
  let session;
  try {
    await client.start();
    session = await client.createSession({ model: "auto" });
    const response = await session.sendAndWait({
      prompt: `Create one fresh outdoor observation mission for a ${duration}-minute neighborhood walk. Return only the mission, in 1-2 short sentences (under 35 words). Make it doable anywhere, screen-free, safe, and accessible; don't require touching, collecting, entering private property, or crossing roads unsafely. Avoid requiring nature or a park.`,
    });
    const mission = response?.data?.content?.trim();
    if (!mission) {
      throw new Error("Copilot returned an empty mission.");
    }
    return mission.slice(0, 240);
  } finally {
    try {
      if (session) {
        await session.disconnect();
      }
    } finally {
      await client.stop();
    }
  }
}

async function handleRequest(request, response) {
  const url = new URL(request.url, `http://${request.headers.host ?? "localhost"}`);
  response.setHeader("X-Content-Type-Options", "nosniff");
  response.setHeader("Referrer-Policy", "no-referrer");

  if (request.method === "POST" && url.pathname === "/api/mission") {
    let body;
    try {
      body = await readJson(request);
    } catch (error) {
      response.writeHead(error.statusCode ?? 400, {
        "Content-Type": "application/json; charset=utf-8",
      });
      response.end(JSON.stringify({ error: error.statusCode ? error.message : "Request must contain valid JSON." }));
      return;
    }
    if (![5, 10, 20].includes(body?.duration)) {
      response.writeHead(400, { "Content-Type": "application/json; charset=utf-8" });
      response.end(JSON.stringify({ error: "Choose a 5, 10, or 20-minute walk." }));
      return;
    }

    try {
      const mission = await generateMission(body.duration);
      response.writeHead(200, {
        "Cache-Control": "no-store",
        "Content-Type": "application/json; charset=utf-8",
      });
      response.end(JSON.stringify({ mission }));
    } catch (error) {
      console.error("Mission generation failed:", error);
      response.writeHead(503, {
        "Cache-Control": "no-store",
        "Content-Type": "application/json; charset=utf-8",
      });
      response.end(JSON.stringify({
        error: "Couldn't get a mission from GitHub Copilot. Check your Copilot CLI sign-in and try again.",
      }));
    }
    return;
  }

  if (request.method !== "GET" || !assets.has(url.pathname)) {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
    return;
  }

  const [filename, contentType] = assets.get(url.pathname);
  try {
    const content = await readFile(join(publicDirectory, filename));
    response.writeHead(200, { "Content-Type": contentType });
    response.end(content);
  } catch (error) {
    console.error(`Unable to serve ${extname(filename)} asset:`, error);
    response.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Unable to load the app.");
  }
}

createServer((request, response) => {
  void handleRequest(request, response).catch((error) => {
    console.error("Request failed:", error);
    if (!response.headersSent) {
      response.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Something went wrong.");
    } else {
      response.destroy(error);
    }
  });
}).listen(port, "127.0.0.1", () => {
  console.log(`Touch Grass is ready at http://localhost:${port}`);
});
