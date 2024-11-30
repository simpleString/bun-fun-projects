import { integer, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";
export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull().unique(),
});

export const messagesTable = pgTable("messages", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  text: varchar({ length: 255 }).notNull(),
  authorId: integer()
    .notNull()
    .references(() => usersTable.id),
});

export const roomsTable = pgTable("rooms", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull().unique(),
  ownerId: integer()
    .notNull()
    .references(() => usersTable.id),
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
