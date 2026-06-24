/**
 * Represents a classroom containing a list of students.
 * * @template T - The type of the student object.
 */
export interface Classroom<T = unknown> {
  name: string;
  students: T[];
}

/**
 * A generic Min-Heap implementation used as a Priority Queue.
 * * @template T - The type of elements stored in the heap.
 */
class MinHeap<T> {
  private heap: T[] = [];

  /**
   * @param comparator - A function that defines the sort order.
   * Returns a negative value if `a` should precede `b`.
   */
  constructor(private readonly comparator: (a: T, b: T) => number) {}

  /**
   * Inserts a new item into the heap.
   * * @param item - The item to insert.
   */
  insert(item: T): void {
    this.heap.push(item);
    this.bubbleUp(this.heap.length - 1);
  }

  /**
   * Removes and returns the minimum element from the heap.
   * * @returns The minimum element, or `undefined` if the heap is empty.
   */
  extractMin(): T | undefined {
    if (this.heap.length === 0) return undefined;

    const min = this.heap[0];
    const last = this.heap.pop()!;

    if (this.heap.length > 0) {
      this.heap[0] = last;
      this.bubbleDown(0);
    }

    return min;
  }

  /**
   * Checks if the heap is empty.
   * * @returns `true` if empty, `false` otherwise.
   */
  isEmpty(): boolean {
    return this.heap.length === 0;
  }

  private bubbleUp(index: number): void {
    let currentIndex = index;
    while (currentIndex > 0) {
      const parentIndex = Math.floor((currentIndex - 1) / 2);
      if (
        this.comparator(this.heap[currentIndex], this.heap[parentIndex]) < 0
      ) {
        [this.heap[currentIndex], this.heap[parentIndex]] = [
          this.heap[parentIndex],
          this.heap[currentIndex],
        ];
        currentIndex = parentIndex;
      } else {
        break;
      }
    }
  }

  private bubbleDown(index: number): void {
    const size = this.heap.length;
    let currentIndex = index;

    while (true) {
      const leftChild = 2 * currentIndex + 1;
      const rightChild = 2 * currentIndex + 2;
      let smallest = currentIndex;

      if (
        leftChild < size &&
        this.comparator(this.heap[leftChild], this.heap[smallest]) < 0
      ) {
        smallest = leftChild;
      }
      if (
        rightChild < size &&
        this.comparator(this.heap[rightChild], this.heap[smallest]) < 0
      ) {
        smallest = rightChild;
      }

      if (smallest !== currentIndex) {
        [this.heap[currentIndex], this.heap[smallest]] = [
          this.heap[smallest],
          this.heap[currentIndex],
        ];
        currentIndex = smallest;
      } else {
        break;
      }
    }
  }
}

/**
 * Internal state for a classroom during the interleaving process.
 * * @template T - The type of the student object.
 */
interface ClassroomState<T = unknown> extends Classroom<T> {
  /** The index of the next student to be picked from the classroom. */
  currentIndex: number;
  /** The total number of students initially in this classroom. */
  totalStudents: number;
  /** The number of students yet to be placed. */
  remainingStudents: number;
  /** The number of students already placed. */
  placedCount: number;
  /** The next ideal insertion position (the "pass") used to sort the heap. */
  targetPosition: number;
}

/**
 * Interleaves students from multiple classrooms evenly.
 * Uses a stride scheduling algorithm via a Min-Heap to ensure a smooth distribution.
 * * @template T - The type of the student object.
 * @param classrooms - An array of classrooms containing students.
 * @returns A single, uniformly interleaved array of students.
 */
export function interleaveStudents<T>(classrooms: Classroom<T>[]): T[] {
  const globalTotalStudents = classrooms.reduce(
    (acc, classroom) => acc + classroom.students.length,
    0,
  );

  if (globalTotalStudents === 0) return [];

  // 1. Initialize states for each classroom
  const states: ClassroomState<T>[] = classrooms.map((classroom) => {
    const totalStudents = classroom.students.length;
    const stride = globalTotalStudents / totalStudents;

    return {
      name: classroom.name,
      students: classroom.students,
      currentIndex: 0,
      totalStudents,
      remainingStudents: totalStudents,
      placedCount: 0,
      // Offset of 0.5 * stride ensures a smoothed start, avoiding early clustering
      targetPosition: 0.5 * stride,
    };
  });

  // 2. Setup Priority Queue
  // Priorities:
  //   1) Lowest targetPosition
  //   2) Lowest remainingStudents (finishes smaller classes first on ties)
  //   3) Alphabetical order by name (for stability)
  const heap = new MinHeap<ClassroomState<T>>((a, b) => {
    if (a.targetPosition !== b.targetPosition)
      return a.targetPosition - b.targetPosition;
    if (a.remainingStudents !== b.remainingStudents)
      return a.remainingStudents - b.remainingStudents;
    return a.name.localeCompare(b.name);
  });

  // 3. Populate Heap
  for (const state of states) {
    if (state.remainingStudents > 0) {
      heap.insert(state);
    }
  }

  const result: T[] = [];

  // 4. Extract and distribute
  while (!heap.isEmpty()) {
    const currentState = heap.extractMin()!;

    // Pick the next student
    const student = currentState.students[currentState.currentIndex];
    result.push(student);

    // Update state
    currentState.currentIndex++;
    currentState.remainingStudents--;
    currentState.placedCount++;

    // Re-insert into heap if students are remaining
    if (currentState.remainingStudents > 0) {
      const stride = globalTotalStudents / currentState.totalStudents;
      // Recalculating targetPosition dynamically using placedCount to prevent floating-point drift
      currentState.targetPosition = (currentState.placedCount + 0.5) * stride;
      heap.insert(currentState);
    }
  }

  return result;
}
