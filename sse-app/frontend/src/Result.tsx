import { app } from "@backend";
import { useEffect, useState } from "react";
import { fetch } from "./api";

function Result() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [result, setResult] = useState<
    app["_routes"]["pokemons"]["result"]["get"]["response"]["200"] | null
  >(null);

  const [counter, setCounter] = useState(0);

  useEffect(() => {
    async function fetchResult() {
      const resultData = await fetch("/pokemons/result", {});
      setResult(resultData.data);
    }
    fetchResult();
  }, []);

  useEffect(() => {
    // First, we need to create an instance of EventSource and pass the data stream URL as a
    // parameter in its constructor
    const es = new EventSource("http://localhost:3000/pokemons/result-sse");
    // Whenever the connection is established between the server and the client we'll get notified
    es.onopen = () => console.log(">>> Connection opened!");
    // Made a mistake, or something bad happened on the server? We get notified here
    es.onerror = (e) => console.log("ERROR!", e);
    // This is where we get the messages. The event is an object and we're interested in its `data` property
    es.onmessage = (e) => {
      console.log(e.data);

      setResult(JSON.parse(e.data));
      setCounter((counter) => counter + 1);
    };

    // Whenever we're done with the data stream we must close the connection
    return () => es.close();
  }, []);

  return (
    <div className="">
      <h1>Result</h1>
      <h2>Counter: {counter}</h2>
      {result?.map((pokemon) => (
        <div className="result-item" key={pokemon.dexId}>
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
