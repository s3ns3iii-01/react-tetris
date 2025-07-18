import React, { useState, useEffect, useCallback } from 'react';
import './App.css';

const GRID_WIDTH = 10;
const GRID_HEIGHT = 20;

const TETROMINOS = [
  [[1, 1, 1, 1]], // I
  [[1, 1], [1, 1]], // O
  [[0, 1, 0], [1, 1, 1]], // T
];

const App = () => {
  const [grid, setGrid] = useState(createEmptyGrid());
  const [currentPiece, setCurrentPiece] = useState(null);
  const [position, setPosition] = useState({ x: 3, y: 0 });
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  function createEmptyGrid() {
    return Array.from({ length: GRID_HEIGHT }, () => Array(GRID_WIDTH).fill(0));
  }

  const spawnPiece = () => {
    const random = Math.floor(Math.random() * TETROMINOS.length);
    const piece = TETROMINOS[random];
    const startPos = { x: 3, y: 0 };
    if (checkCollision(piece, startPos)) {
      setGameOver(true);
    } else {
      setCurrentPiece(piece);
      setPosition(startPos);
    }
  };

  const rotate = (matrix) => {
    return matrix[0].map((_, i) => matrix.map(row => row[i]).reverse());
  };

  const move = useCallback((dir) => {
    if (!checkCollision(currentPiece, { x: position.x + dir, y: position.y })) {
      setPosition(pos => ({ ...pos, x: pos.x + dir }));
    }
  }, [currentPiece, position, grid]);

  const moveDown = useCallback(() => {
    const newPos = { ...position, y: position.y + 1 };
    if (!checkCollision(currentPiece, newPos)) {
      setPosition(newPos);
    } else {
      fixPiece();
    }
  }, [currentPiece, position, grid]);

  const checkCollision = (piece, newPos) => {
    for (let y = 0; y < piece.length; y++) {
      for (let x = 0; x < piece[y].length; x++) {
        if (
          piece[y][x] &&
          (grid[newPos.y + y] === undefined ||
            grid[newPos.y + y][newPos.x + x] === undefined ||
            grid[newPos.y + y][newPos.x + x])
        ) {
          return true;
        }
      }
    }
    return false;
  };

  const fixPiece = () => {
    const newGrid = grid.map(row => [...row]);
    currentPiece.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell && newGrid[position.y + y]) {
          newGrid[position.y + y][position.x + x] = cell;
        }
      });
    });

    clearLines(newGrid);
    setGrid(newGrid);
    spawnPiece();
  };

  const clearLines = (newGrid) => {
    let linesCleared = 0;
    const updatedGrid = newGrid.filter(row => {
      if (row.every(cell => cell !== 0)) {
        linesCleared++;
        return false; // Remove this full row
      }
      return true; // Keep incomplete rows
    });

    while (updatedGrid.length < GRID_HEIGHT) {
      updatedGrid.unshift(Array(GRID_WIDTH).fill(0));
    }

    if (linesCleared > 0) {
      setScore(prev => prev + linesCleared * 100);
    }

    setGrid(updatedGrid);
  };

  const handleRotate = () => {
    if (!currentPiece) return;
    const rotated = rotate(currentPiece);
    if (!checkCollision(rotated, position)) {
      setCurrentPiece(rotated);
    }
  };

  useEffect(() => {
    if (!currentPiece && !gameOver) spawnPiece();
    const interval = setInterval(() => {
      if (!gameOver) moveDown();
    }, 800);
    return () => clearInterval(interval);
  }, [currentPiece, moveDown, gameOver]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!currentPiece || gameOver) return;
      if (e.key === 'ArrowLeft') move(-1);
      if (e.key === 'ArrowRight') move(1);
      if (e.key === 'ArrowDown') moveDown();
      if (e.key === 'ArrowUp') handleRotate();
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentPiece, move, moveDown, handleRotate, gameOver]);

  const renderGrid = () => {
    const displayGrid = grid.map(row => [...row]);
    if (currentPiece) {
      currentPiece.forEach((row, y) => {
        row.forEach((cell, x) => {
          if (cell && displayGrid[position.y + y] && displayGrid[position.y + y][position.x + x] !== undefined) {
            displayGrid[position.y + y][position.x + x] = cell;
          }
        });
      });
    }
    return displayGrid.map((row, y) => (
      <div key={y} className="row">
        {row.map((cell, x) => (
          <div key={x} className={`cell ${cell ? 'filled' : ''}`} />
        ))}
      </div>
    ));
  };

  return (
    <div className="App">
      <h1>Tetris</h1>
      <p>Score: {score}</p>
      {gameOver ? <h2>Game Over</h2> : <div className="grid">{renderGrid()}</div>}
    </div>
  );
};

export default App;
