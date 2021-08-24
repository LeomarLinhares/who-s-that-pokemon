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

function shuffleArray(array) {
  for (let index = array.length - 1; index > 0; index--) {
    const indexOfOtherElement = Math.floor(Math.random() * (index + 1));
    [array[index], array[indexOfOtherElement]] = [array[indexOfOtherElement], array[index]];
  }
  return array;
}

async function getRandomPokemon() {
  const number = randomNumber(1, 898);
  const pokemon = await getPokemonById(number);
  return pokemon;
}

function createAlternative({ name, id }) {
  const alternativesSection = document.getElementById('alternatives-field');
  const alternativeRadio = document.createElement('input');
  const alternativeLabel = document.createElement('label');

  alternativeRadio.setAttribute('type', 'radio');
  alternativeRadio.setAttribute('name', 'alternative');
  alternativeRadio.setAttribute('value', `${name}`);
  alternativeRadio.setAttribute('id', `${id}`);
  alternativeLabel.setAttribute('for', `${name}`);
  alternativeLabel.innerText = `${name}`;

  alternativesSection.appendChild(alternativeRadio);
  alternativesSection.appendChild(alternativeLabel);
}

function createPokemonObject(pokemonResponse) {
  return {
    id: pokemonResponse.id,
    name: pokemonResponse.name,
    sprite: pokemonResponse.sprites.other.dream_world.front_default,
  }
}
