document.addEventListener('DOMContentLoaded', () => {
  // index.html logic (Creator Page)
  const createGameBtn = document.getElementById('createGameBtn');
  const customWordInput = document.getElementById('customWord');
  const linkArea = document.getElementById('linkArea');
  const gameLink = document.getElementById('gameLink');

  if (createGameBtn) { // Check if on index.html
      createGameBtn.addEventListener('click', async () => {
          const word = customWordInput.value.trim();
          if (!word) {
              alert('Please enter a custom word.');
              return;
          }

          try {
              const response = await fetch('/create-game', {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ word: word }),
              });

              if (!response.ok) {
                  const message = await response.json();
                  throw new Error(`HTTP error! status: ${response.status}, body: ${message.error}`);
              }

              const data = await response.json();
              const gameId = data.gameId;
              const gameUrl = `${window.location.origin}/game.html?gameId=${gameId}`;

              gameLink.href = gameUrl;
              gameLink.textContent = gameUrl;
              linkArea.classList.remove('hidden');
          } catch (error) {
              console.error('Error creating game:', error);
              alert('Failed to create game. Please try again.');
          }
      });
  }

  // game.html logic (Player Page)
  const gameBoard = document.getElementById('gameBoard');
  const guessInput = document.getElementById('guessInput');
  const submitGuessBtn = document.getElementById('submitGuessBtn');
  const messageDisplay = document.getElementById('message');

  if (gameBoard) { // Check if on game.html
      const urlParams = new URLSearchParams(window.location.search);
      const gameId = urlParams.get('gameId');
      let secretWord = '';
      let guessesMade = [];
      const maxGuesses = 6; // Example, adjust as needed

      const fetchWord = async (gameId) => {
          try {
              const response = await fetch(`/get-word?gameId=${gameId}`);
              if (!response.ok) {
                  const message = await response.json();
                  throw new Error(`HTTP error! status: ${response.status}, body: ${message.error}`);
              }
              const data = await response.json();
              secretWord = data.word.toUpperCase(); // Ensure word is uppercase for comparison
              initializeGameBoard();
          } catch (error) {
              console.error('Error fetching word:', error);
              messageDisplay.textContent = 'Failed to load game. Please check the link.';
          }
      };

      const initializeGameBoard = () => {
          gameBoard.innerHTML = ''; // Clear any existing board
          for (let i = 0; i < maxGuesses; i++) {
              for (let j = 0; j < secretWord.length; j++) {
                  const tile = document.createElement('div');
                  tile.classList.add('tile');
                  gameBoard.appendChild(tile);
              }
          }
      };

      const updateGameBoard = () => {
          const tiles = gameBoard.childNodes;
          guessesMade.forEach((guess, guessIndex) => {
              for (let i = 0; i < secretWord.length; i++) {
                  const tile = tiles[guessIndex * secretWord.length + i];
                  tile.textContent = guess[i];
                  if (guess[i] === secretWord[i]) {
                      tile.classList.add('correct');
                  } else if (secretWord.includes(guess[i])) {
                      tile.classList.add('present');
                  } else {
                      tile.classList.add('absent');
                  }
              }
          });
      };


      const handleGuess = () => {
          const guess = guessInput.value.trim().toUpperCase();
          if (guess.length !== secretWord.length) {
              messageDisplay.textContent = `Please enter a word with ${secretWord.length} letters.`;
              return;
          }

          if (guessesMade.length < maxGuesses) {
              guessesMade.push(guess);
              updateGameBoard();
              guessInput.value = ''; // Clear input after guess

              if (guess === secretWord) {
                  messageDisplay.textContent = 'Congratulations! You guessed the word!';
                  guessInput.disabled = true;
                  submitGuessBtn.disabled = true;
              } else if (guessesMade.length === maxGuesses) {
                  messageDisplay.textContent = `Game Over! The word was ${secretWord}.`;
                  guessInput.disabled = true;
                  submitGuessBtn.disabled = true;
              } else {
                  messageDisplay.textContent = ''; // Clear message for next guess
              }
          }
      };


      submitGuessBtn.addEventListener('click', handleGuess);
      guessInput.addEventListener('keypress', function (e) {
          if (e.key === 'Enter') {
              handleGuess();
          }
      });


      if (gameId) {
          fetchWord(gameId);
      } else {
          messageDisplay.textContent = 'Game ID is missing from the URL.';
      }
  }
});