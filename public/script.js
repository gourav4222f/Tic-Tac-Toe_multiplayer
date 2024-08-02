const socket = io();

document.getElementById('joinGame').addEventListener('click', () => {
  const username = document.getElementById('username').value;
  if (username) {
    socket.emit('joinGame', username);
  }
});

socket.on('gameFull', () => {
  alert('Game is full! Try again later.');
});

socket.on('startGame', (players) => {
  document.getElementById('login').style.display = 'none';
  document.getElementById('game').style.display = 'block';
  document.getElementById('players').textContent = `Players: ${players.join(' vs ')}`;
});

document.querySelectorAll('.cell').forEach(cell => {
  cell.addEventListener('click', () => {
    const index = cell.getAttribute('data-index');
    socket.emit('makeMove', index);
  });
});

socket.on('updateBoard', (board) => {
  document.querySelectorAll('.cell').forEach((cell, index) => {
    cell.textContent = board[index] === null ? '' : (board[index] === 0 ? 'X' : 'O');
  });
});

socket.on('updateTimer', (timeLeft) => {
  document.getElementById('timer').textContent = `Time left: ${timeLeft}`;
});

socket.on('gameOver', (message) => {
  document.getElementById('message').textContent = message;
  setTimeout(() => {
    document.getElementById('message').textContent = '';
  }, 3000);
});

socket.on('resetGame', () => {
  document.querySelectorAll('.cell').forEach(cell => {
    cell.textContent = '';
  });
  document.getElementById('timer').textContent = `Time left: ${timeLimit}`;
});
