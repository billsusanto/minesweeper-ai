export class ActionQueue {
  private queue: Map<string, { x: number; y: number }>;

  constructor() {
    this.queue = new Map();
  }

  add(position: { x: number; y: number }) {
    const key = `${position.x},${position.y}`;
    if (!this.queue.has(key)) {
      this.queue.set(key, position);
    }
  }

  remove(): { x: number; y: number } | undefined {
    const iterator = this.queue.values();
    const first = iterator.next().value;
    if (first) {
      const key = `${first.x},${first.y}`;
      this.queue.delete(key);
      return first;
    }
    return undefined;
  }

  get size(): number {
    return this.queue.size;
  }

  isEmpty(): boolean {
    return this.queue.size === 0;
  }
}