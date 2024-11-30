import { useNavigate } from "react-router";
import "./App.css";
import { useAppDispatch } from "./store";
import {
  pokemonApi,
  useGetPokemonsQuery,
  useVoteMutation,
} from "./store/pokemonApi";
import { IPokemon } from "./store/pokemonsSlice";

const PokemonComponent = ({
  pokemon,
  onClick,
}: {
  pokemon: IPokemon;
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

const Pokemons = ({ pokemons }: { pokemons: IPokemon[] }) => {
  const [voteMutation] = useVoteMutation();

  const dispatch = useAppDispatch();

  return (
    <div className="pokemons">
      <PokemonComponent
        pokemon={pokemons[0]}
        onClick={async () => {
          const newPair = await voteMutation({
            voteAganstId: pokemons[1].id,
            voteForId: pokemons[0].id,
          });

          dispatch(
            pokemonApi.util.updateQueryData("getPokemons", null, () => {
              return newPair.data;
            })
          );
        }}
      />
      <PokemonComponent
        pokemon={pokemons[1]}
        onClick={async () => {
          const newPair = await voteMutation({
            voteAganstId: pokemons[1].id,
            voteForId: pokemons[0].id,
          });

          dispatch(
            pokemonApi.util.updateQueryData("getPokemons", null, () => {
              return newPair.data;
            })
          );
        }}
      />
    </div>
  );
};

function App() {
  const navigate = useNavigate();
  function handleClickResult() {
    navigate("/result");
  }

  const { data, isLoading } = useGetPokemonsQuery(null);

  if (isLoading || !data) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Pokemons pokemons={data} />
      <button onClick={handleClickResult}>See results</button>
    </div>
  );
}

export default App;
