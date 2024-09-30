import React from 'react';
import { Tile } from './Tile';
import { GameBoard } from '../lib/GameBoard';
import styles from '../styles/Board.module.css';

interface BoardProps {
  gameBoard: GameBoard;
  onTileClick: (x: number, y: number) => void;
}

export const Board: React.FC<BoardProps> = ({ gameBoard, onTileClick }) => {
  return (
    <div
      className={styles.board}
      style={{
        gridTemplateColumns: `repeat(${gameBoard.width}, 40px)`,
        gridTemplateRows: `repeat(${gameBoard.height}, 40px)`,
      }}
    >
      {gameBoard.grid.map((row, x) =>
        row.map((tile, y) => (
          <Tile
            key={`${x},${y}`}
            x={x}
            y={y}
            value={tile}
            onClick={() => onTileClick(x, y)}
          />
        ))
      )}
    </div>
  );
};
