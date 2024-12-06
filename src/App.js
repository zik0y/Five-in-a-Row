import { useState } from "react";

// 方块组件
function Square({ value, onSquareClick, isWinningSquare }) {
  return (
    <button
      className={`square ${value} ${isWinningSquare ? "winning" : ""}`}
      onClick={onSquareClick}
    >
      {value}
    </button>
  );
}

// 棋盘组件
function Board({ xIsNext, squares, lastMoveIndex, onPlay }) {
  function handleClick(i) {
    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    const nextSquares = squares.slice();
    nextSquares[i] = xIsNext ? "X" : "O";
    onPlay(nextSquares, i);
  }

  const { winner, winningSquares } = calculateWinner(squares) || {};
  let status;
  if (winner) {
    status = "Winner: " + winner;
  } else if (squares.every(Boolean)) {
    status = "Draw!";
  } else {
    status = "Next player: " + (xIsNext ? "X" : "O");
  }

  const boardSize = 15;
  const rows = Array.from({ length: boardSize }, (_, rowIndex) => (
    <div key={rowIndex} className="board-row">
      {Array.from({ length: boardSize }, (_, colIndex) => {
        const index = rowIndex * boardSize + colIndex;
        const isWinningSquare = winningSquares?.includes(index);
        return (
          <Square
            key={index}
            value={squares[index]}
            onSquareClick={() => handleClick(index)}
            isLastMove={index === lastMoveIndex}
            isWinningSquare={isWinningSquare} // Pass winning square info
          />
        );
      })}
    </div>
  ));

  return (
    <>
      <div className="status">{status}</div>
      {rows}
    </>
  );
}

// 游戏组件
export default function Game() {
  const boardSize = 15;
  const [history, setHistory] = useState([
    Array(boardSize * boardSize).fill(null),
  ]);
  const [currentMove, setCurrentMove] = useState(0);
  const [lastMoveIndex, setLastMoveIndex] = useState(null);
  const xIsNext = currentMove % 2 === 0;
  const currentSquares = history[currentMove];

  function handlePlay(nextSquares, index) {
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
    setLastMoveIndex(index);
  }

  function jumpTo(nextMove) {
    setCurrentMove(nextMove);
    setLastMoveIndex(null); // 重置高亮
  }

  function resetGame() {
    setHistory([Array(boardSize * boardSize).fill(null)]);
    setCurrentMove(0);
    setLastMoveIndex(null);
  }

  const moves = history.map((squares, move) => {
    let description;
    if (move > 0) {
      description = "Go to move #" + move;
    } else {
      description = "Go to game start";
    }
    return (
      <li key={move}>
        <button onClick={() => jumpTo(move)}>{description}</button>
      </li>
    );
  });

  return (
    <div className="game">
      <div className="game-board">
        <Board
          xIsNext={xIsNext}
          squares={currentSquares}
          lastMoveIndex={lastMoveIndex}
          onPlay={handlePlay}
        />
      </div>
      <div className="game-info">
        <button onClick={resetGame}>Restart Game</button>
        <ol>{moves}</ol>
      </div>
    </div>
  );
}

// 计算胜利者的函数
function calculateWinner(squares) {
  const boardSize = 15;
  const lines = [];

  // 水平、垂直、对角线、反对角线检查
  for (let row = 0; row < boardSize; row++) {
    for (let col = 0; col < boardSize; col++) {
      const index = row * boardSize + col;

      if (col <= boardSize - 5) {
        // 水平方向
        lines.push([index, index + 1, index + 2, index + 3, index + 4]);
      }
      if (row <= boardSize - 5) {
        // 垂直方向
        lines.push([
          index,
          index + boardSize,
          index + 2 * boardSize,
          index + 3 * boardSize,
          index + 4 * boardSize,
        ]);
      }
      if (row <= boardSize - 5 && col <= boardSize - 5) {
        // 主对角线方向
        lines.push([
          index,
          index + boardSize + 1,
          index + 2 * (boardSize + 1),
          index + 3 * (boardSize + 1),
          index + 4 * (boardSize + 1),
        ]);
      }
      if (row <= boardSize - 5 && col >= 4) {
        // 反对角线方向
        lines.push([
          index,
          index + boardSize - 1,
          index + 2 * (boardSize - 1),
          index + 3 * (boardSize - 1),
          index + 4 * (boardSize - 1),
        ]);
      }
    }
  }

  // 检查是否存在胜利的五子连珠
  for (const [a, b, c, d, e] of lines) {
    if (
      squares[a] &&
      squares[a] === squares[b] &&
      squares[a] === squares[c] &&
      squares[a] === squares[d] &&
      squares[a] === squares[e]
    ) {
      return {
        winner: squares[a],
        winningSquares: [a, b, c, d, e], // 返回获胜的方块索引
      };
    }
  }

  return null;
}
