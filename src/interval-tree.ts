class IntervalTreeNode {
  start: number;
  end: number;
  max: number;
  left: IntervalTreeNode | null;
  right: IntervalTreeNode | null;

  constructor(start: number, end: number) {
    this.start = start;
    this.end = end;
    this.max = end;
    this.left = null;
    this.right = null;
  }
}

export class IntervalTree {
  root: IntervalTreeNode | null;

  constructor() {
    this.root = null;
  }

  /**
   * Insert a new interval into the tree.
   */
  insert(start: number, end: number) {
    this.root = this._insert(this.root, start, end);
  }

  _insert(node: IntervalTreeNode | null, start: number, end: number) {
    if (!node) {
      return new IntervalTreeNode(start, end);
    }

    if (start < node.start) {
      node.left = this._insert(node.left, start, end);
    } else {
      node.right = this._insert(node.right, start, end);
    }

    node.max = Math.max(node.max, end);
    return node;
  }

  /**
   * Search for overlapping intervals.
   */
  search(start: number, end: number) {
    const result: IntervalTreeNode[] = [];
    this._search(this.root, start, end, result);
    return result;
  }

  _search(
    node: IntervalTreeNode | null,
    start: number,
    end: number,
    result: IntervalTreeNode[]
  ) {
    if (!node) return;

    if (node.start <= end && start <= node.end) {
      result.push(node);
    }

    if (node.left && node.left.max >= start) {
      this._search(node.left, start, end, result);
    }

    this._search(node.right, start, end, result);
  }
}
