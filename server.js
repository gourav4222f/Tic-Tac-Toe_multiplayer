const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

let players = [];
let board = Array(9).fill(null);
let currentPlayer = 0;
let timer;
const timeLimit = 180; // 3 minutes

app.use(express.static('public'));

io.on('connection', (socket) => {
  console.log('a user connected', socket.id);

  socket.on('joinGame', (username) => {
    if (players.length < 2) {
      players.push({ id: socket.id, name: username });
      if (players.length === 2) {
        startGame();
      }
    } else {
      socket.emit('gameFull');
    }
  });

  socket.on('makeMove', (index) => {
    if (socket.id === players[currentPlayer].id && board[index] === null) {
      board[index] = currentPlayer;
      io.emit('updateBoard', board);
      if (checkWin()) {
        io.emit('gameOver', `${players[currentPlayer].name} wins!`);
        resetGame();
      } else if (board.every(cell => cell !== null)) {
        io.emit('gameOver', 'Draw!');
        resetGame();
      } else {
        currentPlayer = 1 - currentPlayer;
        resetTimer();
      }
    }
  });

  socket.on('disconnect', () => {
    console.log('user disconnected', socket.id);
    players = players.filter(player => player.id !== socket.id);
    resetGame();
  });

  const startGame = () => {
    io.emit('startGame', players.map(player => player.name));
    resetTimer();
  };

  const resetGame = () => {
    board = Array(9).fill(null);
    currentPlayer = 0;
    clearInterval(timer);
    io.emit('resetGame');
  };

  const resetTimer = () => {
    clearInterval(timer);
    let timeLeft = timeLimit;
    timer = setInterval(() => {
      io.emit('updateTimer', timeLeft);
      if (timeLeft === 0) {
        io.emit('gameOver', `${players[1 - currentPlayer].name} wins by timeout!`);
        resetGame();
      }
      timeLeft--;
    }, 1000);
  };

  const checkWin = () => {
    const winPatterns = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];
    return winPatterns.some(pattern => 
      pattern.every(index => board[index] === currentPlayer)
    );
  };
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});
