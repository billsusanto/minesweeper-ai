// TileArea.ts
import { GameBoard, TileState } from "./GameBoard";

export class TileArea {
  private gameBoard: GameBoard;
  private x: number;
  private y: number;

  constructor(gameBoard: GameBoard, x: number, y: number) {
    this.gameBoard = gameBoard;
    this.x = x;
    this.y = y;
  }

  get surroundingTiles(): { x: number; y: number; value: number }[] {
    const neighbors = [];
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        if (dx === 0 && dy === 0) continue;
        const nx = this.x + dx;
        const ny = this.y + dy;
        if (this.gameBoard.isValidPosition(nx, ny)) {
          neighbors.push({
            x: nx,
            y: ny,
            value: this.gameBoard.getTile(nx, ny) || TileState.HIDDEN,
          });
        }
      }
    }
    return neighbors;
  }

  get hiddenCount(): number {
    return this.surroundingTiles.filter(
      (tile) => tile.value === TileState.HIDDEN
    ).length;
  }

  get flaggedCount(): number {
    return this.surroundingTiles.filter(
      (tile) => tile.value === TileState.FLAGGED
    ).length;
  }

  get remainingMines(): number {
    const tileValue = this.gameBoard.getTile(this.x, this.y);
    if (tileValue !== null && tileValue >= 0) {
      return tileValue - this.flaggedCount;
    }
    return 0;
  }
}
