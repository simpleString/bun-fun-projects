import { observer } from "mobx-react";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import "./App.css";
import { Pokemon, PokemonStore } from "./store/pokemonStore";

const pokemonStore = new PokemonStore();

const PokemonComponent = ({
  pokemon,
  onClick,
}: {
  pokemon: Pokemon;
  onClick: () => void;
}) => {
  return (
    <div className="pokemon-card">
      <img
        src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`}
      />
      <button onClick={onClick}>
        <span>{pokemon.name}</span>
      </button>
    </div>
  );
};

const Pokemons = observer(
  ({ pokemonStore }: { pokemonStore: PokemonStore }) => {
    useEffect(() => {
      pokemonStore.getPokemonPair();
    }, [pokemonStore]);

    if (pokemonStore.loadingError) {
      return (
        <div>
          <p>Server error</p>
        </div>
      );
    }

    if (pokemonStore.pokemonPair === null) {
      return (
        <div>
          <p>Loading...</p>
        </div>
      );
    }

    return (
      <div className="pokemons">
        <PokemonComponent
          pokemon={pokemonStore.pokemonPair[0]}
          onClick={() =>
            pokemonStore.setVote(
              pokemonStore.pokemonPair![0].id,
              pokemonStore.pokemonPair![1].id
            )
          }
        />
        <PokemonComponent
          pokemon={pokemonStore.pokemonPair[1]}
          onClick={() =>
            pokemonStore.setVote(
              pokemonStore.pokemonPair![1].id,
              pokemonStore.pokemonPair![0].id
            )
          }
        />
      </div>
    );
  }
);

function App() {
  const navigate = useNavigate();
  function handleClickResult() {
    navigate("/result");
  }

  return (
    <div>
      <Pokemons pokemonStore={pokemonStore} />
      <button onClick={handleClickResult}>See results</button>
    </div>
  );
}

export default App;
