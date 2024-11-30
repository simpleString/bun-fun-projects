ALTER TABLE "votes" RENAME COLUMN "createdAt" TO "created_at";--> statement-breakpoint
ALTER TABLE "votes" RENAME COLUMN "voteFor" TO "vote_for";--> statement-breakpoint
ALTER TABLE "votes" RENAME COLUMN "voteAganst" TO "vote_aganst";--> statement-breakpoint
ALTER TABLE "votes" DROP CONSTRAINT "votes_voteFor_pokemons_id_fk";
--> statement-breakpoint
ALTER TABLE "votes" DROP CONSTRAINT "votes_voteAganst_pokemons_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "votes" ADD CONSTRAINT "votes_vote_for_pokemons_id_fk" FOREIGN KEY ("vote_for") REFERENCES "public"."pokemons"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "votes" ADD CONSTRAINT "votes_vote_aganst_pokemons_id_fk" FOREIGN KEY ("vote_aganst") REFERENCES "public"."pokemons"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
