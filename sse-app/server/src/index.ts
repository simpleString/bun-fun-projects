import cors from "@elysiajs/cors";
import { staticPlugin } from "@elysiajs/static";
import swagger from "@elysiajs/swagger";
import { eq, getTableColumns, inArray } from "drizzle-orm";
import { NodePgClient, NodePgDatabase } from "drizzle-orm/node-postgres";
import { Elysia, t } from "elysia";
import { db as dbUsage } from "./db";
import { pokemonTable, voteTable } from "./db/schema";

const clients = [];

let shouldUpdate = false;

function getRandomNumberForPokemon(max = 1025) {
  const first = Math.floor(Math.random() * max) + 1;
  let second;
  do {
    second = Math.floor(Math.random() * max) + 1;
  } while (second === first);
  return [first, second] as const;
}

async function getRandomPokemonPair(
  db: NodePgDatabase<Record<string, never>> & {
    $client: NodePgClient;
  }
) {
  const [first, second] = getRandomNumberForPokemon();

  const pokemons = await db
    .select()
    .from(pokemonTable)
    .where(inArray(pokemonTable.id, [first, second]));

  return pokemons;
}

async function getResult(
  db: NodePgDatabase<Record<string, never>> & {
    $client: NodePgClient;
  }
) {
  const result = await db
    .select({
      ...getTableColumns(pokemonTable),
      voteFor: db.$count(voteTable, eq(voteTable.voteFor, pokemonTable.id)),
      voteAganst: db.$count(
        voteTable,
        eq(voteTable.voteAganst, pokemonTable.id)
      ),
    })
    .from(pokemonTable);

  return result
    .map((p) => {
      const totalVotes = p.voteFor + p.voteAganst;

      return {
        dexId: p.id,
        name: p.name,
        upVotes: p.voteFor,
        downVotes: p.voteAganst,
        winPercentage: totalVotes > 0 ? (p.voteFor / totalVotes) * 100 : 0,
      };
    })
    .sort((a, b) => {
      // Sort by win percentage first
      if (b.winPercentage !== a.winPercentage) {
        return b.winPercentage - a.winPercentage;
      }
      // Break ties by upvotes
      return b.upVotes - a.upVotes;
    });
}

const dbPlugin = new Elysia({ name: "dbPlugin" })
  .state("version", 1)
  .decorate("db", dbUsage);

const pokemonsRoute = new Elysia({
  prefix: "/pokemons",
})
  .use(dbPlugin)
  .get("/random-pair", async ({ db }) => {
    return getRandomPokemonPair(db);
  })
  .post(
    "/vote",
    async ({ db, body }) => {
      await db.insert(voteTable).values({
        voteAganst: body.voteAganstId,
        voteFor: body.voteForId,
      });

      shouldUpdate = true;
      // shouldUpdateClients = true;

      // await Promise.all(
      //   clients.map(async (c) =>
      //     c.send(`data: ${JSON.stringify(await getResult(db))}\n\n`)
      //   )
      // );

      return getRandomPokemonPair(db);
    },
    {
      body: t.Object({
        voteForId: t.Integer(),
        voteAganstId: t.Integer(),
      }),
    }
  )
  .get("/result", async ({ db }) => {
    return getResult(db);
  })
  .get("/result-sse", async function ({ db, request, server }) {
    const { signal } = request;

    const stream = new ReadableStream({
      async start(controller) {
        // controller.enqueue("event: interval\n" + "data: ping\n\n");
        setInterval(() => {
          if (signal.aborted) {
            // controller.close();
            return;
          }
          controller.enqueue("event: interval\n" + "data: ping\n\n");
          // clearInterval(interval);
        }, 5000);

        while (true) {
          if (signal.aborted) {
            console.log("aborted");
            // controller.close();
            // clearInterval(interval);
            return;
          }
          // console.log("shouldUpdate", shouldUpdate);
          if (shouldUpdate) {
            controller.enqueue(
              `data: ${JSON.stringify(await getResult(db))}\n\n`
            );
            shouldUpdate = false;
          }
          // controller.enqueue("event: interval\n" + "data: ping\n\n");
          await new Promise((resolve) => setTimeout(resolve, 1));
        }
      },
    });

    signal.addEventListener("abort", () => {
      clients.splice(clients.indexOf(stream), 1);
    });

    clients.push(stream);

    const response = new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });

    // signal.addEventListener("abort", () => {
    //   clients.splice(clients.indexOf(), 1);
    // });

    // return response;

    // console.log(request);
    // const stream = new Stream();
    // return new Response()
    // stream.send("hello world");
    // clients.push(stream);

    // request.signal.addEventListener("abort", () => {
    //   clients.splice(clients.indexOf(stream), 1);
    // });

    // function keepAlive() {
    //   setTimeout(() => {
    //     stream.send("ping");
    //     keepAlive();
    //   }, 1000);
    // }

    // keepAlive();

    // while (true) {
    //   yield "event: ping\n";
    //   yield "data: ok\n\n";

    // await new Promise((resolve) => setTimeout(resolve, 1000));
    // yield `id: interval${i} \n\n`;
    // yield `data: ${JSON.stringify({ num: i })}\n\n`;
    // yield "event: hello\n";
    // console.log(shouldUpdateCients);
    // if (shouldUpdateClients) {
    // shouldUpdateClients = false;
    // yield `data: ${JSON.stringify(await getResult(db))}\n\n`;
    // }
    // if (!shouldUpdateCients) {
    //   yield "data: ok\n\n";
    // }
    // yield `data: ${JSON.stringify(await getResult(db))}\n\n`;
    // yield "id: -1\ndata:\n\n";
    // await new Promise((resolve) => setTimeout(resolve, 1000));
    // }
    return response;
    // return new Response(stream, {
    //   headers: {
    //     "Content-Type": "text/event-stream",
    //     "Cache-Control": "no-cache",
    //     Connection: "keep-alive",
    //   },
    // });
  });

const app = new Elysia()
  .onError(({ error, code }) => {
    console.error(error);
  })
  .use(staticPlugin())
  .use(cors())
  .use(swagger())
  .use(dbPlugin)
  .use(pokemonsRoute)
  .listen({
    port: 3000,
    // idleTimeout: 255,
  });

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);

export type app = typeof app;
