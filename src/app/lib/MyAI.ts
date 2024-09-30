import { Action, ActionType } from "./Action";
import { GameBoard, TileState } from "./GameBoard";
import { ActionQueue } from "./ActionQueue";

export class MyAI {
  private gameBoard: GameBoard;
  private actionQueue: ActionQueue;
  private processedPositions: Set<string>;
  private moveQueue: Action[];
  private pendingMove?: Action;

  constructor(
    width: number,
    height: number,
    mineCount: number,
    initialX: number,
    initialY: number
  ) {
    this.gameBoard = new GameBoard(
      width,
      height,
      initialX,
      initialY,
      mineCount
    );
    this.actionQueue = new ActionQueue();
    this.processedPositions = new Set();
    this.moveQueue = [];
    this.pendingMove = new Action(ActionType.UNCOVER, initialX, initialY);
  }

  getAction(number: number): Action | undefined {
    if (number !== -1) {
      if (this.pendingMove?.getMove() !== ActionType.UNCOVER) {
        return;
      }
      const x = this.pendingMove.getX();
      const y = this.pendingMove.getY();
      if (x !== undefined && y !== undefined) {
        this.gameBoard.updateGrid(x, y, number);
      }
    }
    console.log("Movequeue", this.moveQueue[0]);
    if (this.moveQueue.length === 0) {
      this.processTurn();
      // Before leaving, perform one last check to ensure all hidden tiles have been processed
      if (this.moveQueue.length === 0) {
        const hiddenPositions = this.gameBoard.getHiddenPositions();
        for (const { x, y } of hiddenPositions) {
          const posKey = `${x},${y}`;
          if (!this.processedPositions.has(posKey)) {
            this.moveQueue.push(new Action(ActionType.UNCOVER, x, y));
            this.processedPositions.add(posKey);
            return this.moveQueue.shift();
          }
        }
        return new Action(ActionType.LEAVE);
      }
    }

    this.pendingMove = this.moveQueue.shift();
    return this.pendingMove;
  }

  private processTurn() {
    while (true) {
      if (this.moveQueue.length > 0) {
        return;
      }

      if (!this.processedPositions.has("0,0")) {
        console.log("Adding (0,0) to moveQueue");
        this.moveQueue.push(new Action(ActionType.UNCOVER, 0, 0));
        this.processedPositions.add("0,0");
        return;
      }

      const tileCounts = this.gameBoard.getTileCounts();
      if (tileCounts.get(TileState.HIDDEN) === 0) {
        this.moveQueue.push(new Action(ActionType.LEAVE));
        return;
      }

      if (this.actionQueue.isEmpty()) {
        this.fullScan();
        if (this.actionQueue.isEmpty() || this.moveQueue.length === 0) {
          this.selectBestTile();
          if (this.moveQueue.length === 0) {
            return;
          }
          return;
        }
      }

      const currentTilePos = this.actionQueue.remove();
      if (!currentTilePos) {
        break;
      }
      const { x, y } = currentTilePos;
      const posKey = `${x},${y}`;

      if (this.processedPositions.has(posKey)) {
        continue;
      }

      const tileValue = this.gameBoard.getTile(x, y);
      if (tileValue === null || tileValue < 0) {
        continue;
      }

      this.applyTileLogic(x, y, tileValue);
    }
  }

  private applyTileLogic(x: number, y: number, tileValue: number) {
    const neighbors = this.gameBoard.getNeighboringTiles(x, y);

    let flaggedCount = 0;
    let hiddenCount = 0;
    const hiddenNeighbors: { x: number; y: number }[] = [];

    for (const { x: nx, y: ny } of neighbors) {
      const neighborValue = this.gameBoard.getTile(nx, ny);

      if (neighborValue === TileState.FLAGGED) {
        flaggedCount++;
      } else if (neighborValue === TileState.HIDDEN) {
        hiddenCount++;
        hiddenNeighbors.push({ x: nx, y: ny });
      }
    }

    const remainingMines = tileValue - flaggedCount;

    // If all remaining mines are accounted for, the hidden neighbors are safe to uncover
    if (remainingMines === 0) {
      for (const pos of hiddenNeighbors) {
        const posKey = `${pos.x},${pos.y}`;
        if (!this.processedPositions.has(posKey)) {
          this.moveQueue.push(new Action(ActionType.UNCOVER, pos.x, pos.y));
          this.actionQueue.add(pos);
          this.processedPositions.add(posKey); // Mark this position as processed
        }
      }
    }
    // If the number of remaining mines equals the number of hidden neighbors, all hidden neighbors must be mines
    else if (remainingMines === hiddenCount) {
      for (const pos of hiddenNeighbors) {
        this.moveQueue.push(new Action(ActionType.FLAG, pos.x, pos.y));
        this.gameBoard.placeFlag(pos.x, pos.y);
      }
    }

    // Mark this tile as processed since we've applied the logic
    const posKey = `${x},${y}`;
    this.processedPositions.add(posKey);
  }

  private selectBestTile() {
    const hiddenPositions = this.gameBoard.getHiddenPositions();
    if (hiddenPositions.length === 0) return;

    // Find the first unprocessed hidden tile
    const unprocessedTile = hiddenPositions.find(
      ({ x, y }) => !this.processedPositions.has(`${x},${y}`)
    );

    if (unprocessedTile) {
      this.moveQueue.push(
        new Action(ActionType.UNCOVER, unprocessedTile.x, unprocessedTile.y)
      );
      this.actionQueue.add(unprocessedTile);
      this.processedPositions.add(`${unprocessedTile.x},${unprocessedTile.y}`);
    } else {
      // Fallback to uncover any hidden tile if all seem to be processed (avoid missing any)
      const bestTile = hiddenPositions[0];
      this.moveQueue.push(
        new Action(ActionType.UNCOVER, bestTile.x, bestTile.y)
      );
      this.actionQueue.add(bestTile);
      this.processedPositions.add(`${bestTile.x},${bestTile.y}`);
    }
  }

  private fullScan() {
    for (let x = 0; x < this.gameBoard.width; x++) {
      for (let y = 0; y < this.gameBoard.height; y++) {
        const tileValue = this.gameBoard.getTile(x, y);
        if (tileValue !== null && tileValue >= 0) {
          this.applyTileLogic(x, y, tileValue);
        }
      }
    }
  }
}
