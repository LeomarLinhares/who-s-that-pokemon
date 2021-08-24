// const fetch = require('node-fetch');

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
  alternativeRadio.setAttribute('value', `${id}`);
  alternativeLabel.setAttribute('for', `${name}`);
  alternativeLabel.innerText = `${name}`;

  alternativesSection.appendChild(alternativeRadio);
  alternativesSection.appendChild(alternativeLabel);
}

function createPokemonObject(pokemonResponse) {
  let sprite = '';
  if (pokemonResponse.sprites.other.dream_world.front_default) {
    sprite = pokemonResponse.sprites.other.dream_world.front_default;
  } else {
    sprite = pokemonResponse.sprites.other['official-artwork'].front_default;
  }

  return {
    id: pokemonResponse.id,
    name: pokemonResponse.name,
    sprite,
  }
}

async function createQuestion() {
  const rightAnswerResponse = await getRandomPokemon();
  const rightAnswerObject = createPokemonObject(rightAnswerResponse);
  const imageContainer = document.getElementById('image-container');
  const image = document.createElement('img');
  const alternatives = [];

  alternatives.push(rightAnswerObject);
  for (let index = 0; index < 5; index += 1) {
    const newAlternative = await getRandomPokemon();
    const notExist = !alternatives.filter((element) => element.id === newAlternative.id);
    if (!notExist) {
      alternatives.push(createPokemonObject(newAlternative));
    } else {
      index -= 1;
    }
  }

  shuffleArray(alternatives);
  alternatives.forEach((element) => createAlternative(element));

  image.className = 'pokemonImage';
  image.src = rightAnswerObject.sprite;
  image.id = rightAnswerObject.id;
  imageContainer.appendChild(image);
}

window.onload = () => {
  const confirmButton = document.getElementById('confirm');
  confirmButton.addEventListener('click', () => {
    const rightAnswer = document.querySelector('.pokemonImage');
    const selectedRadio = document.querySelector('input[name="alternative"]:checked').value;

    if (selectedRadio === rightAnswer.id) {
      alert('Acertou');
    }
  })
}