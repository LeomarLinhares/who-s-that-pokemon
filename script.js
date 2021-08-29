const confirmButton = document.getElementById('confirm');
const skipQuestion = document.getElementById('skip');
const arrowDown = document.getElementById('arrow-down');
const arrowUp = document.getElementById('arrow-up');
const clueButton = document.getElementById('clue');
const scoreElement = document.getElementById('score');
let scoreCount = 0;
let loadedPokemons = [];
let highScores = [];

async function getPokemonById(id) {
  const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}/`);
  const pokeObject = await response.json();
  return pokeObject;
}

function randomNumber(min, max) {
  const minValue = Math.ceil(min);
  const maxValue = Math.floor(max);
  return Math.floor(Math.random() * (maxValue - minValue + 1)) + minValue;
}

function arrayOfTwoRandomNumbersWithout(min, max, forbiddenNumber) {
  const array = [];
  let first = randomNumber(min, max);
  let second = randomNumber(min, max);
  let weCanNotCreate = first === second || first === forbiddenNumber || second === forbiddenNumber;
  while (weCanNotCreate) {
    first = randomNumber(min, max);
    second = randomNumber(min, max);
    weCanNotCreate = first === second || first === forbiddenNumber || second === forbiddenNumber;
  }
  array.push(first);
  array.push(second);
  return array;
}

function shuffleArray(arr) {
  const array = arr;
  for (let index = array.length - 1; index > 0; index -= 1) {
    const indexOfOtherElement = Math.floor(Math.random() * (index + 1));
    [array[index], array[indexOfOtherElement]] = [array[indexOfOtherElement], array[index]];
  }
  return array;
}

async function getRandomPokemon() {
  const number = randomNumber(1, 151);
  const isLoaded = loadedPokemons.find((element) => element.id === number);
  if (isLoaded) {
    return isLoaded;
  }
  const response = await getPokemonById(number);
  return response;
}

function createAlternative({ name, id }) {
  const alternativesSection = document.getElementById('alternatives-field');
  const label = document.createElement('label');
  const alternativeRadio = document.createElement('input');
  const alternativeSpan = document.createElement('span');

  label.classList.add('radioContainer');
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
  };
}

async function saveOnLocalStorage() {
  const stringfiedLoadedPokemons = await JSON.stringify(loadedPokemons);
  const stringfiedHighScores = await JSON.stringify(highScores);
  localStorage.setItem('wtp-loaded-pokemons', stringfiedLoadedPokemons);
  localStorage.setItem('wtp-local-highscores', stringfiedHighScores);
}

function pushToLoadedPokemons(object) {
  const isLoaded = loadedPokemons.find((element) => element.id === object.id);
  if (!isLoaded) {
    loadedPokemons.push(object);
  }
}

async function loadFromLocalStorage() {
  const stringfiedLoadedPokemons = await localStorage.getItem('wtp-loaded-pokemons');
  const stringfiedHighScores = await localStorage.getItem('wtp-local-highscores');
  const parsedLoadedPokemons = await JSON.parse(stringfiedLoadedPokemons);
  const parsedHighScores = await JSON.parse(stringfiedHighScores);
  if (stringfiedLoadedPokemons && stringfiedHighScores) {
    loadedPokemons = parsedLoadedPokemons;
    highScores = parsedHighScores;
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
  pushToLoadedPokemons(rightAnswerResponse);
  const rightAnswerObject = createPokemonObject(rightAnswerResponse);
  const imageContainer = document.querySelector('.grid');
  const image = document.createElement('img');
  const alternatives = [];

  alternatives.push(rightAnswerObject);

  for (let index = 0; index < 5; index += 1) {
    const newAlternative = await getRandomPokemon();
    pushToLoadedPokemons(newAlternative);
    const forbiddenElement = alternatives.filter((element) => element.id === newAlternative.id);
    if (!alternatives.includes(forbiddenElement)) {
      alternatives.push(createPokemonObject(newAlternative));
    } else {
      index -= 1;
    }
  }

  await saveOnLocalStorage();

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
  const otherPossibilities = arrayOfTwoRandomNumbersWithout(0, 5, indexOfRightAnswer);

  if (scoreCount === 0) {
    scoreCount = 0;
  }
  scoreCount -= 1;

  allAlternatives.forEach((element, index) => {
    const canWeChange = index === otherPossibilities[0] || index === otherPossibilities[1];
    const span = element.nextElementSibling;
    if (element.value === rightAnswer.id || canWeChange) {
      span.classList.add('clueHighlight');
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

function rightAnswerEvent() {
  scoreCount += 2;
  const acertou = document.getElementById('result');
  scoreElement.innerText = scoreCount;
  acertou.innerText = 'ACERTOU';
  acertou.classList.add('correctAnswer');
  setTimeout(() => {
    acertou.innerText = '';
    acertou.classList.remove('correctAnswer');
    reload();
  }, 4000);
}

function wrongAnswerEvent() {
  scoreCount = 0;
  const acertou = document.getElementById('result');
  scoreElement.innerText = scoreCount;
  acertou.innerText = 'ERROU';
  acertou.classList.add('wrongAnswer');
  setTimeout(() => {
    acertou.innerText = '';
    acertou.classList.remove('wrongAnswer');
    reload();
  }, 4000);
}

function lockButton() {
  confirmButton.disabled = true;
  skipQuestion.disabled = true;
  clueButton.disabled = true;
  setTimeout(() => {
    confirmButton.disabled = false;
    skipQuestion.disabled = false;
    clueButton.disabled = false;
  }, 4000);
}

function confirmChoice() {
  const rightAnswer = document.querySelector('.pokemon');
  const selectedRadio = document.querySelector('input[name="answer"]:checked').value;

  if (selectedRadio === rightAnswer.id) {
    rightAnswer.classList.remove('secret');
    rightAnswerEvent();
    lockButton();
  } else {
    rightAnswer.classList.remove('secret');
    rightPokemon();
    wrongAnswerEvent();
    lockButton();
  }
}

window.onload = async () => {
  skipQuestion.addEventListener('click', reload);
  arrowDown.addEventListener('click', keyDown);
  arrowUp.addEventListener('click', keyUp);
  clueButton.addEventListener('click', getClue);
  confirmButton.addEventListener('click', confirmChoice);
  await loadFromLocalStorage();
  await started();
};

window.addEventListener('keydown', (event) => {
  switch (event.keyCode) {
    case 38:
      keyUp();
      break;

    case 40:
      keyDown();
      break;

    case 13:
      confirmChoice();
      break;

    default:
      break;
  }
})