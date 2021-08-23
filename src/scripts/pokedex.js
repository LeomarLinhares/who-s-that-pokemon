const { getPokemonById } = require('./api');
const { randomNumber } = require('./utils');

async function getRandomPokemon() {
  const number = randomNumber(1, 898);
  const pokemon = await getPokemonById(number);
  return pokemon;
}


