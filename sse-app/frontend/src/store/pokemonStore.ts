import { makeAutoObservable, runInAction } from "mobx";
import { fetch } from "../api";

export class Pokemon {
  id: number;
  name: string;
  constructor(id: number, name: string) {
    makeAutoObservable(this);
    this.id = id;
    this.name = name;
  }
}

export class PokemonStore {
  pokemonList: Pokemon[];

  pokemonPair: [Pokemon, Pokemon] | null;

  loadingError: string | false;

  constructor() {
    makeAutoObservable(this);
    // runInAction(this.getPokemonPair);

    this.pokemonList = [];
    this.pokemonPair = null;
    this.loadingError = false;
  }

  async getPokemonPair() {
    const response = await fetch("/pokemons/random-pair", {});

    if (response.error) {
      this.loadingError = response.error.message;
      return;
    }

    runInAction(() => {
      this.pokemonPair = [
        new Pokemon(response.data[0].id, response.data[0].name),
        new Pokemon(response.data[1].id, response.data[1].name),
      ];
    });
  }

  async setVote(forId: number, againstId: number) {
    const response = await fetch("/pokemons/vote", {
      method: "POST",
      body: {
        voteAganstId: againstId,
        voteForId: forId,
      },
    });

    if (response.error) {
      this.loadingError = response.error.message;
      return;
    }

    runInAction(() => {
      this.pokemonPair = [
        new Pokemon(response.data[0].id, response.data[0].name),
        new Pokemon(response.data[1].id, response.data[1].name),
      ];
    });
  }
}
