import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface IPokemon {
  id: number;
  name: string;
}

const initialState: IPokemon[] = [];

const pokemonsSlice = createSlice({
  name: "pokemons",
  initialState,
  reducers: {
    pokemonAdded(state, action: PayloadAction<{ id: number; name: string }>) {
      state.push({
        id: action.payload.id,
        name: action.payload.name,
      });
    },
  },
});

export const { pokemonAdded } = pokemonsSlice.actions;
export default pokemonsSlice.reducer;
