import { integer, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";
export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  age: integer().notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
});

export const pokemonTable = pgTable("pokemons", {
  id: integer().primaryKey(),
  name: varchar({ length: 255 }).notNull(),
});

export const voteTable = pgTable("votes", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  createdAt: timestamp().defaultNow(),

  voteFor: integer()
    .notNull()
    .references(() => pokemonTable.id),
  voteAganst: integer()
    .notNull()
    .references(() => pokemonTable.id),
});
