import * as tables from '/tables.js';

function evaluateBoard(chess) {
  if (chess.in_checkmate()) {
    if (chess.turn() === 'w') return -9999;
    return 9999;
  }

  if (chess.in_stalemate()) return 0;

  if (chess.insufficient_material()) return 0;

  const table = {
    p: tables.pawntable,
    n: tables.knightstable,
    b: tables.bishopstable,
    r: tables.rookstable,
    q: tables.queenstable,
    k: tables.kingstable,
  };

  const pieces = {
    wp: { amount: 0, value: 0 },
    bp: { amount: 0, value: 0 },
    wn: { amount: 0, value: 0 },
    bn: { amount: 0, value: 0 },
    wb: { amount: 0, value: 0 },
    bb: { amount: 0, value: 0 },
    wr: { amount: 0, value: 0 },
    br: { amount: 0, value: 0 },
    wq: { amount: 0, value: 0 },
    bq: { amount: 0, value: 0 },
    wk: { amount: 0, value: 0 },
    bk: { amount: 0, value: 0 },
  };

  const board = chess.board();
  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board[i].length; j++) {
      const cell = board[i][j];
      if (cell !== null) {
        const { color, type } = cell;
        if (color === 'b') {
          const piece = color + type;
          pieces[piece].amount++;
          pieces[piece].value += table[type][i][j];
        } else {
          const piece = color + type;
          pieces[piece].amount++;
          pieces[piece].value += -table[type][board.length - i - 1][j];
        }
      }
    }
  }

  const { wp, bp, wn, bn, wb, bb, wr, br, wq, bq, wk, bk } = pieces;

  const material =
    100 * (wp.amount - bp.amount) +
    320 * (wn.amount - bn.amount) +
    330 * (wb.amount - bb.amount) +
    500 * (wr.amount - br.amount) +
    900 * (wq.amount - bq.amount);

  let evaluate =
    material +
    wp.value +
    bp.value +
    wn.value +
    bn.value +
    wb.value +
    bb.value +
    wr.value +
    br.value +
    wq.value +
    bq.value +
    wk.value +
    bk.value;

  if (chess.turn() === 'w') return evaluate;
  return -evaluate;
}

function alphaBeta(alpha, beta, depth, chess) {
  let bestScore = -9999;
  if (depth === 0) {
    return evaluateBoard(chess);
  }
  for (const move of chess.moves()) {
    chess.move(move);
    const score = -alphaBeta(-beta, -alpha, depth - 1, chess);
    chess.undo();
    if (score >= beta) return score;
    if (score > bestScore) bestScore = score;
    if (score > alpha) alpha = score;
  }
  return bestScore;
}

export function selectMove(depth, chess) {
  let bestMove = null;
  let bestValue = -99999;
  let alpha = -100000;
  let beta = 100000;
  for (const move of chess.moves()) {
    chess.move(move);
    const boardValue = -alphaBeta(-beta, -alpha, depth - 1, chess);
    if (boardValue > bestValue) {
      bestValue = boardValue;
      bestMove = move;
    }
    if (boardValue > alpha) {
      alpha = boardValue;
    }
    chess.undo();
  }
  return bestMove;
}
