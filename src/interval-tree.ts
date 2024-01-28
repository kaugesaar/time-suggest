class IntervalTreeNode {
  start: number;
  end: number;
  max: number;
  left: IntervalTreeNode | null;
  right: IntervalTreeNode | null;

  /**
   * Constructs a node with the given interval.
   * @param start The start of the interval.
   * @param end The end of the interval.
   */
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
   * Public method to insert a new interval.
   * @param start The start of the interval.
   * @param end The end of the interval.
   */
  insert(start: number, end: number) {
    this.root = this._insertRecursive(this.root, start, end);
  }

  /**
   * Helper method to insert a new interval into the tree.
   * @param node The current node in the tree.
   * @param start The start of the interval.
   * @param end The end of the interval.
   * @returns The updated node.
   */
  private _insertRecursive(
    node: IntervalTreeNode | null,
    start: number,
    end: number
  ): IntervalTreeNode {
    if (!node) {
      return new IntervalTreeNode(start, end);
    }

    if (start < node.start) {
      node.left = this._insertRecursive(node.left, start, end);
    } else {
      node.right = this._insertRecursive(node.right, start, end);
    }

    node.max = Math.max(node.max, end);
    return node;
  }

  /**
   * Public method to search for overlapping intervals.
   * @param start The start of the interval to search for.
   * @param end The end of the interval to search for.
   * @returns A list of overlapping intervals.
   */
  search(start: number, end: number): IntervalTreeNode[] {
    const result: IntervalTreeNode[] = [];
    this._searchRecursive(this.root, start, end, result);
    return result;
  }

  /**
   * Helper method to search for overlapping intervals in the tree.
   * @param node The current node in the tree.
   * @param start The start of the interval to search for.
   * @param end The end of the interval to search for.
   * @param result The list to store overlapping intervals.
   */
  private _searchRecursive(
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
      this._searchRecursive(node.left, start, end, result);
    }

    if (node.right) {
      this._searchRecursive(node.right, start, end, result);
    }
  }
}
