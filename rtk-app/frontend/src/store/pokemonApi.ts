import type { app } from "@backend";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

type PokemonPair =
  app["_routes"]["pokemons"]["random-pair"]["get"]["response"]["200"];

export const pokemonApi = createApi({
  reducerPath: "pokemonApi",
  baseQuery: fetchBaseQuery({ baseUrl: "http://localhost:3000/pokemons" }),

  tagTypes: ["pairs-pokemons"],

  endpoints: (build) => ({
    getPokemons: build.query<PokemonPair, unknown>({
      query: () => "random-pair",
    }),

    vote: build.mutation<
      app["_routes"]["pokemons"]["vote"]["post"]["response"]["200"],
      {
        voteAganstId: number;
        voteForId: number;
      }
    >({
      query: ({ voteAganstId, voteForId }) => ({
        url: "vote",
        method: "POST",
        body: {
          voteAganstId,
          voteForId,
        },
      }),

      // onCacheEntryAdded(arg, api) {
      //   api.dispatch(
      //     pokemonApi.util.updateQueryData("getPokemons", null, (data) => {
      //       console.log(data);
      //     })
      //   );
      // },
    }),
  }),
});

export const { useGetPokemonsQuery, useVoteMutation } = pokemonApi;
