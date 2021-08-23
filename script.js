const botao = document.querySelector('.btn');
const pokemon = document.querySelector('.pokemon')

botao.addEventListener('click', () => {
  pokemon.classList.remove('secret')
})