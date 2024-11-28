import { app } from "@backend";
import { useEffect, useState } from "react";
import { fetch } from "./api";

function Result() {
  const [result, setResult] = useState<
    app["_routes"]["pokemons"]["result"]["get"]["response"]["200"] | null
  >(null);

  useEffect(() => {
    async function fetchResult() {
      const resultData = await fetch("/pokemons/result", {});

      setResult(resultData.data);
    }
    fetchResult();
  }, []);

  return (
    <div className="">
      <h1>Result</h1>
      {result?.map((pokemon) => (
        <div className="result-item">
          <div className="result-item--first">
            <img
              src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.dexId}.png`}
            />

            <span>{pokemon.name}</span>
          </div>
          <div className="result-item--second">
            <div className="">
              <p className="up-votes">Up {pokemon.upVotes}</p>
              <p className="down-votes">Down {pokemon.downVotes}</p>
            </div>
            <p>{pokemon.winPercentage}%</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Result;
