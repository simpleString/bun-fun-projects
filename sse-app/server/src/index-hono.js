import { Hono } from "hono";
import { cors } from "hono/cors";
import { streamSSE } from "hono/streaming";

import { serve } from "@hono/node-server";

const app = new Hono({});
let id = 0;

app.use("*", cors());

app.get("/", (c) => c.text("Hono!"));

app.get("/sse", async (c) => {
  return streamSSE(c, async (stream) => {
    while (true) {
      const message = `It is ${new Date().toISOString()}`;
      await stream.writeSSE({
        data: message,
        event: "time-update",
        id: String(id++),
      });
      await stream.sleep(1000);
    }
  });
});

serve({
  port: "3001",
  fetch: app.fetch,
});
