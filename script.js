const fetch = require('node-fetch');

async function getPokemonById(id) {
  const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}/`);
  const pokeObject = await response.json();
  return pokeObject;
}

function randomNumber(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function getRandomPokemon() {
  const number = randomNumber(1, 898);
  const pokemon = await getPokemonById(number);
  return pokemon;
}

