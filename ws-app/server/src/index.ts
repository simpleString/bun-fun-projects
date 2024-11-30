import cors from "@elysiajs/cors";
import { staticPlugin } from "@elysiajs/static";
import swagger from "@elysiajs/swagger";
import { Elysia } from "elysia";
import { db as dbUsage } from "./db";

const clients = [];

const dbPlugin = new Elysia({ name: "dbPlugin" }).decorate("db", dbUsage);

const messages: string[] = [];
let i = 0;

const app = new Elysia()
  .onError(({ error, code }) => {
    console.error(error);
  })
  .use(staticPlugin())
  .use(cors())
  .use(swagger())
  .use(dbPlugin)
  .ws("/ws", {
    beforeHandle: (ee) => {
      ee.headers["user"] = "user" + i;
      i++;
    },

    close(ws, code, message) {
      console.log(clients.length);
      clients.splice(clients.indexOf(ws), 1);
      console.log(clients.length);
    },

    open(ws) {
      clients.push(ws);

      console.log("ws opened");
      ws.send(JSON.stringify(messages));

      setInterval(() => {
        messages.push("hid");
        clients.map((c) => c.send(messages));
      }, 1000);
    },

    message(ws, message) {
      messages.push(message);
      clients.map((c) => c.send(messages));
    },
  })
  .listen({
    port: 3000,
  });

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);

export type app = typeof app;
