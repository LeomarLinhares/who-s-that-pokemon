// const fetch = require('node-fetch');
const pula = document.querySelector('.pula');

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
  const number = randomNumber(1, 151);
  const response = await getPokemonById(number);
  return response;
}

function createAlternative({ name, id }) {
  const alternativesSection = document.getElementById('alternatives-field');
  const div = document.createElement('div')
  const alternativeRadio = document.createElement('input');
  const alternativeLabel = document.createElement('label');

  div.classList.add('radioContainer')

  alternativeRadio.setAttribute('type', 'radio');
  alternativeRadio.setAttribute('name', 'alternative');
  alternativeRadio.setAttribute('value', `${id}`);
  alternativeLabel.setAttribute('for', `${name}`);
  alternativeLabel.innerText = `${name}`;

  div.appendChild(alternativeRadio);
  div.appendChild(alternativeLabel);
  alternativesSection.appendChild(div);

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

async function started() {
  const rightAnswerResponse = await getRandomPokemon();
  const rightAnswerObject = createPokemonObject(rightAnswerResponse);
  const imageContainer = document.querySelector('.grid');
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
  
  image.className = 'pokemon secret';
  image.src = rightAnswerObject.sprite;
  image.id = rightAnswerObject.id;
  imageContainer.appendChild(image);
}

function reload() {
  const imageContainer = document.querySelector('.grid');
  const alternativesField = document.getElementById('alternatives-field');
  imageContainer.removeChild(document.querySelector('.pokemon'));
  alternativesField.innerHTML = '';
  started();
}

function confirm() {
  const rightAnswer = document.querySelector('.pokemon');
  const selectedRadio = document.querySelector('input[name="alternative"]:checked').value;

  if (selectedRadio === rightAnswer.id) {
    rightAnswer.classList.remove('secret');
  }
}

window.onload = () => {
  pula.addEventListener('click', reload);
  const confirmButton = document.querySelector('.revelar');
  confirmButton.addEventListener('click', confirm);
  started();
}