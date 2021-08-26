// const fetch = require('node-fetch');
const jumpQuestion = document.querySelector('.pula');
const arrowDown = document.querySelector('.baixo');
const arrowUp = document.querySelector('.cima');
const clueButton = document.querySelector('.dica');
let contador = 0;

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

function randomNumberWithout(min, max, forbiddenNumber) {
  let number = randomNumber(min, max);
  while (number === forbiddenNumber) {
    number = randomNumber(min, max);
  }
  return number;
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
  const label = document.createElement('label')
  const alternativeRadio = document.createElement('input');
  const alternativeSpan = document.createElement('span');

  label.classList.add('radioContainer')
  alternativeRadio.className = 'nes-radio is-dark';

  alternativeRadio.setAttribute('type', 'radio');
  alternativeRadio.setAttribute('name', 'answer');
  alternativeRadio.setAttribute('value', `${id}`);
  alternativeSpan.setAttribute('for', `${name}`);
  alternativeSpan.innerText = `${name}`;

  label.appendChild(alternativeRadio);
  label.appendChild(alternativeSpan);
  alternativesSection.appendChild(label);
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

function keyDown() {
  const selectedRadio = document.querySelector('input[name="answer"]:checked');
  const father = selectedRadio.parentElement;
  father.nextSibling.firstElementChild.checked = true;
}

function keyUp() {
  const selectedRadio = document.querySelector('input[name="answer"]:checked');
  const father = selectedRadio.parentElement;
  father.previousSibling.firstElementChild.checked = true;
}

function checkTheFirst() {
  const alternativesField = document.getElementById('alternatives-field');
  const alternativeContainer = alternativesField.firstElementChild;
  alternativeContainer.firstChild.checked = true;
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
    const forbiddenElement = alternatives.filter((element) => element.id === newAlternative.id);
    if (!alternatives.includes(forbiddenElement)) {
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

  checkTheFirst();
}

function reload() {
  const imageContainer = document.querySelector('.grid');
  const alternativesField = document.getElementById('alternatives-field');
  imageContainer.removeChild(document.querySelector('.pokemon'));
  alternativesField.innerHTML = '';
  started();
  clueButton.disabled = false;
}

function findInputIndex(array, inputRadioElement) {
  let elementIndex = -1;
  array.forEach((element, index) => {
    if (element.value === inputRadioElement.id) {
      elementIndex = index; 
    }
  });
  return elementIndex;
}

function getClue() {
  const rightAnswer = document.querySelector('.pokemon');
  const allAlternatives = document.querySelectorAll('input[name="answer"]');
  const indexOfRightAnswer = findInputIndex(allAlternatives, rightAnswer);
  const otherPossibilities = [randomNumberWithout(0, 5, indexOfRightAnswer), randomNumberWithout(0, 5, indexOfRightAnswer)];
  allAlternatives.forEach((element, index) => {
    const canWeChange = index === otherPossibilities[0] || index === otherPossibilities[1];
    const span = element.nextElementSibling;
    if (element.value === rightAnswer.id || canWeChange) {
      span.classList.add('testDica');
    }
  });
  clueButton.disabled = true;
}

function rightPokemon() {
  const rightAnswer = document.querySelector('.pokemon');
  const allAlternatives = document.querySelectorAll('input[name="answer"]');
  allAlternatives.forEach((element) => {
    if (element.value === rightAnswer.id) {
      const span = element.nextElementSibling;
      span.classList.add('rightPokemon');
    }
  });

}

function placar() {
  const placar = document.querySelector('.placar')
  contador += 1
  placar.innerText = contador
}

function zeraPlacar() {
  const placar = document.querySelector('.placar')
  contador = 0
  placar.innerText = contador
}

function confirmChoice() {
  const rightAnswer = document.querySelector('.pokemon');
  const selectedRadio = document.querySelector('input[name="answer"]:checked').value;

  if (selectedRadio === rightAnswer.id) {
    rightAnswer.classList.remove('secret');
    const acertou = document.querySelector('.result')
    acertou.innerText = 'ACERTOU'
    acertou.classList.add('acertou')
    placar()
    setTimeout(() => {
      acertou.innerText = ''
      acertou.classList.remove('acertou')
      reload()
    }, 4000);
  } else {
    rightAnswer.classList.remove('secret');
    const acertou = document.querySelector('.result')
    acertou.innerText = 'ERROU'
    acertou.classList.add('errou')
    rightPokemon()
    zeraPlacar()
    setTimeout(() => {
      acertou.innerText = ''
      acertou.classList.remove('errou')
      reload()
    }, 4000);
  }
}

window.onload = async () => {
  const confirmButton = document.querySelector('.revelar');
  jumpQuestion.addEventListener('click', reload);
  arrowDown.addEventListener('click', keyDown);
  arrowUp.addEventListener('click', keyUp);
  clueButton.addEventListener('click', getClue);
  confirmButton.addEventListener('click', confirmChoice);
  await started();
}