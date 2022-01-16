import { Chess } from 'chess.js';
import { selectMove } from './algorithm';

// https://chessboardjs.com/examples#5003
var board = null;
var game = new Chess();
var whiteSquareGrey = '#a9a9a9';
var blackSquareGrey = '#696969';

function removeGreySquares() {
  $('#myBoard .square-55d63').css('background', '');
}

function greySquare(square) {
  var $square = $('#myBoard .square-' + square);

  var background = whiteSquareGrey;
  if ($square.hasClass('black-3c85d')) {
    background = blackSquareGrey;
  }

  $square.css('background', background);
}

function onDragStart(source, piece) {
  // do not pick up pieces if the game is over
  if (game.game_over()) return false;

  // or if it's not that side's turn
  if (
    (game.turn() === 'w' && piece.search(/^b/) !== -1) ||
    (game.turn() === 'b' && piece.search(/^w/) !== -1)
  ) {
    return false;
  }
}

function onDrop(source, target) {
  removeGreySquares();

  // see if the move is legal
  var move = game.move({
    from: source,
    to: target,
    promotion: 'q', // NOTE: always promote to a queen for example simplicity
  });

  // illegal move
  if (move === null) return 'snapback';
}

function onMouseoverSquare(square, piece) {
  // get list of possible moves for this square
  var moves = game.moves({
    square: square,
    verbose: true,
  });

  // exit if there are no moves available for this square
  if (moves.length === 0) return;

  // highlight the square they moused over
  greySquare(square);

  // highlight the possible squares for this piece
  for (var i = 0; i < moves.length; i++) {
    greySquare(moves[i].to);
  }
}

function onMouseoutSquare(square, piece) {
  removeGreySquares();
}

function onSnapEnd() {
  makeMove();
}

var config = {
  draggable: true,
  position: 'start',
  onDragStart: onDragStart,
  onDrop: onDrop,
  onMouseoutSquare: onMouseoutSquare,
  onMouseoverSquare: onMouseoverSquare,
  onSnapEnd: onSnapEnd,
};

board = Chessboard('myBoard', config);

// -----------------------------------------------------------------

const btnNewGame = document.querySelector('.game');
const btnUndo = document.querySelector('.undo');
const depth = document.querySelector('#depth');
const table = document.querySelector('.table');

const setBoard = () => {
  board.position(game.fen());
};

const makeMove = () => {
  // extract depth value from string
  const depthValue = depth.value.match(/(\d+)/)[0];
  const move = selectMove(depthValue, game);
  game.move(move);
  setBoard();
  addHistory();
};

const resetHistory = () => {
  table.innerHTML = `
    <thead>
      <tr>
        <th>#</th>
        <th>White</th>
        <th>Black</th>
      </tr>
    </thead>
  `;
};

const addHistory = () => {
  resetHistory();
  let counter = 0;
  const history = game.history();
  for (let i = 0; i < history.length; i += 2) {
    const white = history[i],
      black = history[i + 1];
    counter++;
    if (black === undefined) black = '';
    const html = `
      <tr>
        <td>${counter}.</td>
        <td>${white}</td>
        <td>${black}</td>
      </tr>
    `;
    table.insertAdjacentHTML('beforeend', html);
  }
};

btnNewGame.addEventListener('click', () => {
  game.reset();
  resetHistory();
  setBoard();
});

btnUndo.addEventListener('click', () => {
  game.undo();
  game.undo();
  addHistory();
  setBoard();
});
