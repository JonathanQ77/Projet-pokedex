import { useState, useEffect } from "react";
import Pokecard from "../components/Pokecard/Pokecard";
import { toast } from "react-toastify";
import { useLoaderData } from "react-router-dom";

export default function Home() {
  // Variables
  const loaderPokemons = useLoaderData();

  // States
  const [pokemons, setPokemons] = useState(loaderPokemons);
  const [loading, setLoading] = useState(false);

  // Fetch first 30 pokemons
  const fetchPokemons = async (add = false) => {
    setLoading(true);
    // Get the first pokemons
    const response = await fetch(
      `https://pokeapi.co/api/v2/pokemon?limit=30${
        add && "&offset=" + pokemons.length
      }`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      toast.error("Une erreur est survenue");
      setLoading(false);
    }

    const data = await response.json(); // 30 first pokemons

    // Get the details
    const promises = data.results.map(async (pokemon) => {
      const response = await fetch(
        `https://pokeapi.co/api/v2/pokemon/${pokemon.name}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      return await response.json();
    });

    const pokemonDetails = await Promise.all(promises);

    // My created pokemons
    const myPokemonsArray = [];
    if (!add) {
      const myPokemonsResponse = await fetch(
        `https://pokedex-cd328-default-rtdb.europe-west1.firebasedatabase.app/pokemons.json`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const myPokemonsData = await myPokemonsResponse.json();

      // Transform data to pokeapi

      for (const key in myPokemonsData) {
        myPokemonsArray.push({
          id: key,
          ...myPokemonsData[key],
        });
      }
    }

    setPokemons(
      add
        ? [...pokemons, ...pokemonDetails]
        : [...myPokemonsArray, ...pokemonDetails]
    );
    setLoading(false);
  };

  // useEffect(() => {
  //     fetchPokemons();
  // }, []);

  return (
    <div>
      {/* Pokemons */}
      <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-10 max-w-7xl mx-auto mt-10 md:p-0 p-5">
        {pokemons.map((pokemon, index) => (
          <Pokecard key={index} pokemon={pokemon} />
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center items-center text-white mt-5">
          Chargement...
        </div>
      )}

      {/* Add */}
      <div className="flex justify-center my-10">
        <button
          className="bg-white hover:bg-gray-50 rounded-full text-black py-2 px-5 text-lg font-semibold shadow-lg hover:shadow-xl transition duration-150 disabled:opacity-80 disabled:cursor-wait"
          onClick={() => fetchPokemons(true)}
          disabled={loading}
        >
          Encore plus de Pokémons !
        </button>
      </div>
    </div>
  );
}

export async function loader() {
  // Get the first pokemons
  const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=30`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Impossible de charger les Pokémons");
  }

  const data = await response.json(); // 30 first pokemons

  // Get the details
  const promises = data.results.map(async (pokemon) => {
    const response = await fetch(
      `https://pokeapi.co/api/v2/pokemon/${pokemon.name}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return await response.json();
  });

  const pokemonDetails = await Promise.all(promises);

  // My created pokemons
  const myPokemonsArray = [];
  const myPokemonsResponse = await fetch(
    `https://pokedex-cd328-default-rtdb.europe-west1.firebasedatabase.app/pokemons.json`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  const myPokemonsData = await myPokemonsResponse.json();

  // Transform data to pokeapi

  for (const key in myPokemonsData) {
    myPokemonsArray.push({
      id: key,
      ...myPokemonsData[key],
    });
  }

  return [...myPokemonsArray, ...pokemonDetails];
}
