import React from 'react';
import { TileState } from '../lib/GameBoard';
import styles from '../styles/Board.module.css';

interface TileProps {
  x: number;
  y: number;
  value: number;
  onClick: (x: number, y: number) => void;
}

export const Tile: React.FC<TileProps> = ({ x, y, value, onClick }) => {
  const handleClick = () => {
    onClick(x, y);
  };

  let displayValue = '';
  if (value === TileState.HIDDEN) {
    displayValue = '';
  } else if (value === TileState.FLAGGED) {
    displayValue = '🚩';
  } else if (value === -1) {
    displayValue = '💣';
  } else if (value >= 0) {
    displayValue = value.toString();
  }

  return (
    <button
      className={`${styles.tile} ${value >= 0 ? styles[`number-${value}`] : ''}`}
      onClick={handleClick}
      disabled={value !== TileState.HIDDEN}
    >
      {displayValue}
    </button>
  );
};
