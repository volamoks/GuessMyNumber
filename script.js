'use strict';

//readind
// document.querySelector('.message').textContent();

// writing
// document.querySelector('.message').textContent = 'Correct Number';
// document.querySelector('.number').textContent = 13;
// document.querySelector('.score').textContent = 18 ;
// document.querySelector('.guess').value = 23
let statedNumber = Math.trunc(Math.random() * 20) + 1;
let score = 20;
let highestScore = 0;

const displayMessage = message => {
  document.querySelector('.message').textContent = message;
};

const setBg = color => {
  document.querySelector('body').style.backgroundColor = color;
};

const setScore = score => {
  document.querySelector('.score').textContent = score;
};

const setNumber = num => {
  document.querySelector('.number').textContent = num;
};
// document.querySelector('.number').textContent = statedNumber;

document.querySelector('.again').addEventListener('click', () => {
  score = 20;
  statedNumber = Math.trunc(Math.random() * 20) + 1;
  setScore(20);
  displayMessage('Start guessing...');
  document.querySelector('.guess').value = '';
  setBg('#222');
  setNumber('?');
  document.querySelector('.highscore').textContent = highestScore;
});

document.querySelector('.check').addEventListener('click', () => {
  const guess = Number(document.querySelector('.guess').value);
  console.log(guess, typeof guess);
  if (!guess) {
    displayMessage('No number!');
    // when WINS
  } else if (guess === statedNumber) {
    displayMessage('You got it!');
    setBg('rgb(42, 157, 52)');
    setNumber(statedNumber);
    if (score > highestScore) {
      highestScore = score;
    }
    document.querySelector('.highscore').textContent = highestScore;
    //when diggerent
  } else if (guess !== statedNumber) {
    if (score > 1) {
      displayMessage(guess < statedNumber ? 'Too low ' : 'Too high');
      score--;
      setScore(score);
    } else {
      setScore(0);
      displayMessage('💥You loose');
    }
  }
});
