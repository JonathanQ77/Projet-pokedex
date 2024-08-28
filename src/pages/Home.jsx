import { useState, useEffect } from "react";
import Pokecard from "../components/Pokecard/Pokecard";
import { toast } from "react-toastify";
import { useLoaderData } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "../utils/query";
import { motion, spring } from "framer-motion";
export default function Home() {
  // Fetch first 30 pokemons
  const fetchPokemons = async () => {
    // setLoading(true); // GERER PAR USEQUERY
    // Get the first pokemons
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=30`, {
      // contente de recuperer les 30 pokemons
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      // toast.error("Une erreur est survenue"); // UTLISATION DE THROW ERROR QUI SERA RECUPERER PAR USEQUERY
      throw new Error("Une erreur est survenu.");
      // setLoading(false); gerer par useQuery
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
    // setPokemons(
    //   // Remplacer par return [...myPokemonsArray, ...pokemonDetails]; comme le state est gerer par data de useQuery
    //   add
    //     ? [...pokemons, ...pokemonDetails]
    //     : [...myPokemonsArray, ...pokemonDetails]
    // );
    // setLoading(false); useQuery a la place
  };

  const fetchMorePokemons = async () => {
    // FETCH POUR AFFICHER LES POKEMONS RESTANT DANS LES DATAS
    const response = await fetch(
      `https://pokeapi.co/api/v2/pokemon?limit=30&offset=${pokemons.length}`,
      {
        //  recuperer les prochains  pokemons
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      // toast.error("Une erreur est survenue"); // UTLISATION DE THROW ERROR QUI SERA RECUPERER PAR USEQUERY
      throw new Error("Une erreur est survenu.");
      // setLoading(false); gerer par useQuery
    }

    const data = await response.json(); // 30 first pokemons

    // Get the details des pokemons deja charger
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
    console.log(pokemonDetails);
    console.log("data", pokemons);
    return [...pokemons, ...pokemonDetails];
  };

  const {
    data: pokemons,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["pokemons"],
    queryFn: fetchPokemons,
    staleTime: 10000, // DELAI AVANT CHANGEMENTR DE DONNEES
    gcTime: 5 * 60 * 1000, // duree maximal du cache qui garder calcul pour ms : minutes * secondes * 1000
  });

  const { mutate, isPending } = useMutation({
    mutationFn: fetchMorePokemons,
    onSuccess: (data) => {
      queryClient.setQueryData(["pokemons"], data);
    },
  });
  //USE EFFECT GERE LERREUR USEQUERY

  useEffect(() => {
    if (isError) {
      toast.error(error);
    }
  }, [error, isError]);
  return (
    <div>
      {/* Pokemons */}
      <motion.div
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.15,
            },
          },
        }}
        initial="hidden"
        animate="visible"
        transition={{ spring }}
        className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-10 max-w-7xl mx-auto mt-10 md:p-0 p-5"
      >
        {pokemons?.map((pokemon, index) => (
          <motion.div
            key={index}
            variants={{
              hidden: { opacity: 0, scale: 0.8 },
              visible: {
                opacity: [0.3, 0.5, 0.7, 1],
                scale: [0.9, 1, 1.1, 1.2, 1.3, 1.2, 1.1, 1],
              },
            }}
          >
            <Pokecard pokemon={pokemon} />
          </motion.div>
        ))}
      </motion.div>

      {/* Loading */}
      {isLoading && (
        <div className="flex justify-center items-center text-white mt-5">
          Chargement...
        </div>
      )}

      {/* Add */}
      <div className="flex justify-center my-10">
        <button
          className="bg-white hover:bg-gray-50 rounded-full text-black py-2 px-5 text-lg font-semibold shadow-lg hover:shadow-xl transition duration-150 disabled:opacity-80 disabled:cursor-wait"
          onClick={mutate}
          disabled={isPending}
        >
          Encore plus de Pokémons !
        </button>
      </div>
    </div>
  );
}
