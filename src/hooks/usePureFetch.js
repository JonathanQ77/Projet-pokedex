export const usePureFetch = (url, opt) => {
  const fetchData = async () => {
    try {
      return await fetch(url).then((res) => res.json()); // traduit la data json sous forme javascript return renvoi DATA
    } catch (error) {
      // gerer le cas d erreur
      throw new Error(error); // erreur recuperer par useQuery
    }
  };

  const data = fetchData();

  // OPT stock la data et fait la verification si sa viens de pokeAPI ou firebase si opt = true
  opt && opt(data);
  return data;
};
