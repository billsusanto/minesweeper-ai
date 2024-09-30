"use client";

import React, { useState } from "react";
import { Board } from "./components/Board";
import { MyAI } from "./lib/MyAI";
import { GameBoard } from "./lib/GameBoard";
import { ActionType } from "./lib/Action";

const Home: React.FC = () => {
  // State variables for user inputs
  const [width, setWidth] = useState(10);
  const [height, setHeight] = useState(10);
  const [mineCount, setMineCount] = useState(10);

  // Game state variables
  const [gameBoard, setGameBoard] = useState<GameBoard | null>(null);
  const [ai, setAi] = useState<MyAI | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);

  // Function to start the game
  const startGame = () => {
    const newGameBoard = new GameBoard(
      width,
      height,
      0,
      0,
      mineCount
    );
    const newAI = new MyAI(width, height, mineCount, 0, 0);
    setGameBoard(newGameBoard);
    setAi(newAI);
    setGameOver(false);
    setGameWon(false);

    // Start the AI moves immediately if needed
    handleAIMoves(newGameBoard, -1);
  };

  // Function to reset the game
  const resetGame = () => {
    setGameBoard(null);
    setAi(null);
    setGameOver(false);
    setGameWon(false);
  };

  const handleTileClick = (x: number, y: number) => {
    if (!gameBoard || !ai || gameOver || gameWon) return;

    const updatedBoard = gameBoard.clone();
    const result = updatedBoard.uncover(x, y);

    if (result === -1) {
      setGameOver(true);
      setGameBoard(updatedBoard);
    } else {
      setGameBoard(updatedBoard);

      // Check if the user won after uncovering
      if (updatedBoard.isGameWon()) {
        setGameWon(true);
        return;
      }

      // Let the AI take over
      handleAIMoves(updatedBoard, result);
    }
  };

  const handleAIMoves = (board: GameBoard, lastResult: number) => {
    if (!ai) return;

    let updatedBoard = board.clone();
    let aiAction = ai.getAction(lastResult);

    while (aiAction && !gameOver) {
      if (
        aiAction.getMove() === ActionType.UNCOVER &&
        aiAction.getX() !== undefined &&
        aiAction.getY() !== undefined
      ) {
        const result = updatedBoard.uncover(
          aiAction.getX(),
          aiAction.getY()
        );

        if (result === -1) {
          setGameOver(true);
          setGameBoard(updatedBoard);
          break;
        }

        setGameBoard(updatedBoard);
        aiAction = ai.getAction(result);

        // Check if the game is won after the AI's move
        if (updatedBoard.isGameWon()) {
          setGameWon(true);
          return;
        }
      } else if (
        aiAction.getMove() === ActionType.FLAG &&
        aiAction.getX() !== undefined &&
        aiAction.getY() !== undefined
      ) {
        updatedBoard.placeFlag(aiAction.getX(), aiAction.getY());
        setGameBoard(updatedBoard);
        aiAction = ai.getAction(-1); // Continue with the AI action
      } else if (aiAction.getMove() === ActionType.LEAVE) {
        setGameOver(true);
        return;
      } else {
        break;
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1>Minesweeper AI</h1>

      {/* Input fields for board size and mine count */}
      <div className="flex space-x-2">
        <input
          type="number"
          value={width}
          onChange={(e) => setWidth(Number(e.target.value))}
          placeholder="Width"
          min={5}
          max={30}
          className="border p-1"
        />
        <input
          type="number"
          value={height}
          onChange={(e) => setHeight(Number(e.target.value))}
          placeholder="Height"
          min={5}
          max={30}
          className="border p-1"
        />
        <input
          type="number"
          value={mineCount}
          onChange={(e) => {
            const mines = Number(e.target.value);
            if (mines >= 1 && mines < width * height) {
              setMineCount(mines);
            }
          }}
          placeholder="Mines"
          min={1}
          max={width * height - 1}
          className="border p-1"
        />
      </div>

      {/* Start and Reset buttons */}
      <div className="flex space-x-2 mt-2">
        <button onClick={startGame} className="bg-blue-500 text-white p-2">
          Start
        </button>
        <button onClick={resetGame} className="bg-red-500 text-white p-2">
          Reset
        </button>
      </div>

      {/* Render the game board only if the game has started */}
      {gameBoard && (
        <>
          <Board gameBoard={gameBoard} onTileClick={handleTileClick} />
          {gameOver && <p>Game Over!</p>}
          {gameWon && <p>You Won!</p>}
        </>
      )}
    </div>
  );
};

export default Home;
