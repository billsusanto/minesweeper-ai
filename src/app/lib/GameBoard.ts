export enum TileState {
  HIDDEN = -1,
  FLAGGED = -2,
}

export class GameBoard {
  grid: number[][];
  mineLocations: Set<string>;
  mines: number;
  width: number;
  height: number;
  initialized: boolean;

  constructor(
    width: number,
    height: number,
    startX: number,
    startY: number,
    mines: number
  ) {
    this.width = width;
    this.height = height;
    this.mines = mines;
    this.grid = Array.from({ length: width }, () =>
      Array(height).fill(TileState.HIDDEN)
    );
    this.mineLocations = new Set();
    this.initialized = false;
  }

  isValidPosition(x: number, y: number): boolean {
    return x >= 0 && x < this.width && y >= 0 && y < this.height;
  }

  getTile(x: number, y: number): number | null {
    return this.isValidPosition(x, y) ? this.grid[x][y] : null;
  }

  setTile(x: number, y: number, value: number): void {
    if (this.isValidPosition(x, y)) {
      this.grid[x][y] = value;
    }
  }

  updateGrid(x: number, y: number, value: number): void {
    this.setTile(x, y, value);
  }

  placeFlag(x: number, y: number): void {
    this.setTile(x, y, TileState.FLAGGED);
  }

  removeFlag(x: number, y: number): void {
    this.setTile(x, y, TileState.HIDDEN);
  }

  getHiddenPositions(): { x: number; y: number }[] {
    const hiddenPositions: { x: number; y: number }[] = [];
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        if (this.grid[x][y] === TileState.HIDDEN) {
          hiddenPositions.push({ x, y });
        }
      }
    }
    return hiddenPositions;
  }

  clone(): GameBoard {
    const clonedBoard = new GameBoard(
      this.width,
      this.height,
      0,
      0,
      this.mines
    );
    clonedBoard.grid = this.grid.map((row) => [...row]);
    clonedBoard.mineLocations = new Set(this.mineLocations);
    clonedBoard.initialized = this.initialized;
    return clonedBoard;
  }

  private initializeMines(startX: number, startY: number): void {
    while (this.mineLocations.size < this.mines) {
      const x = Math.floor(Math.random() * this.width);
      const y = Math.floor(Math.random() * this.height);

      // Avoid placing a mine on the first click position
      if ((x !== startX || y !== startY) && !this.mineLocations.has(`${x},${y}`)) {
        this.mineLocations.add(`${x},${y}`);
      }
    }
    this.initialized = true;
  }

  uncover(x: number, y: number): number {
    if (!this.isValidPosition(x, y)) return -1;

    if (!this.initialized) {
      this.initializeMines(x, y);
    }

    const tile = this.grid[x][y];

    if (tile === TileState.FLAGGED) return -1;
    if (tile >= 0) return tile; 

    if (this.mineLocations.has(`${x},${y}`)) {
      this.grid[x][y] = -1;
      return -1;
    }

    let mineCount = 0;
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        if (dx === 0 && dy === 0) continue;
        const nx = x + dx;
        const ny = y + dy;
        if (this.isValidPosition(nx, ny) && this.mineLocations.has(`${nx},${ny}`)) {
          mineCount++;
        }
      }
    }

    this.grid[x][y] = mineCount;
    return mineCount;
  }

  getTileCounts(): Map<number, number> {
    const tileCounts = new Map<number, number>();

    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        const value = this.grid[x][y];
        tileCounts.set(value, (tileCounts.get(value) || 0) + 1);
      }
    }

    return tileCounts;
  }

  getNeighboringTiles(x: number, y: number): { x: number; y: number }[] {
    const neighbors: { x: number; y: number }[] = [];

    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        if (dx === 0 && dy === 0) continue;
        const nx = x + dx;
        const ny = y + dy;
        if (this.isValidPosition(nx, ny)) {
          neighbors.push({ x: nx, y: ny });
        }
      }
    }

    return neighbors;
  }

  isGameWon(): boolean {
    let uncoveredTiles = 0;

    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        if (this.grid[x][y] >= 0) uncoveredTiles++;
      }
    }

    return uncoveredTiles === this.width * this.height - this.mines;
  }
}
