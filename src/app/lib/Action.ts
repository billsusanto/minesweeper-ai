export enum ActionType {
  LEAVE = 0,
  UNCOVER = 1,
  FLAG = 2,
  UNFLAG = 3,
}

export class Action {
  private action: ActionType;
  private x: number;
  private y: number;

  constructor(action: ActionType, x = 0, y = 0) {
    this.action = action;
    this.x = x;
    this.y = y;
  }

  getMove(): ActionType {
    return this.action;
  }

  getX(): number {
    return this.x;
  }

  getY(): number {
    return this.y;
  }
}
