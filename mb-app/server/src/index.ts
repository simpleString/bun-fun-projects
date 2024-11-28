import cors from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { eq, getTableColumns, inArray } from "drizzle-orm";
import { NodePgClient, NodePgDatabase } from "drizzle-orm/node-postgres";
import { Elysia, t } from "elysia";
import { db as dbUsage } from "./db";
import { pokemonTable, voteTable } from "./db/schema";

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
  });

const app = new Elysia()
  .use(cors())
  .use(swagger())
  .use(dbPlugin)
  .use(pokemonsRoute)
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);

export type app = typeof app;
