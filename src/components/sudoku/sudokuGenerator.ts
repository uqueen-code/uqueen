// ============================================
// Sudoku Puzzle Generator
// ============================================
// Pure JavaScript — zero dependencies.
// Generates valid Sudoku puzzles with unique solutions
// across three difficulty levels (初级 / 中级 / 高级).
// ============================================

export type Difficulty = 'easy' | 'medium' | 'hard';
export type CellValue = number | 0; // 0 = empty
export type Board = CellValue[][]; // 9x9 grid

/** How many cells to remove for each difficulty */
const REMOVE_COUNT: Record<Difficulty, number> = {
  easy: 36,   // ~45 given → 36 blanks
  medium: 46, // ~35 given → 46 blanks
  hard: 54,   // ~27 given → 54 blanks
};

// ---- Internal helpers ----

/** Create an empty 9x9 board filled with 0 */
function emptyBoard(): Board {
  return Array.from({ length: 9 }, () => Array(9).fill(0) as CellValue[]);
}

/** Deep-clone a board */
function cloneBoard(board: Board): Board {
  return board.map(row => [...row]);
}

/** Check if placing `num` at (row, col) is valid */
function isValid(board: Board, row: number, col: number, num: number): boolean {
  // Row check
  for (let c = 0; c < 9; c++) {
    if (board[row][c] === num) return false;
  }
  // Column check
  for (let r = 0; r < 9; r++) {
    if (board[r][col] === num) return false;
  }
  // 3x3 box check
  const boxR = Math.floor(row / 3) * 3;
  const boxC = Math.floor(col / 3) * 3;
  for (let r = boxR; r < boxR + 3; r++) {
    for (let c = boxC; c < boxC + 3; c++) {
      if (board[r][c] === num) return false;
    }
  }
  return true;
}

/** Shuffle an array in-place (Fisher-Yates) */
function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j]!, arr[i]!];
  }
  return arr;
}

// ---- Solver (with counting for uniqueness check) ----

/**
 * Solve the board using backtracking.
 * If `countOnly` is true, stops after finding 2 solutions
 * (enough to determine uniqueness).
 * Returns the number of solutions found (0, 1, or 2).
 */
function solveCount(board: Board, countOnly = false): number {
  let count = 0;

  function solve(): boolean {
    // Find next empty cell
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (board[r][c] === 0) {
          const nums = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
          for (const num of nums) {
            if (isValid(board, r, c, num)) {
              board[r][c] = num;
              if (solve()) return true;
              board[r][c] = 0;
            }
          }
          return false; // no valid number → backtrack
        }
      }
    }
    count++;
    return countOnly ? count >= 2 : true; // stop early if counting
  }

  solve();
  return count;
}

/**
 * Deterministic solve (no shuffle) — used for uniqueness check
 * to ensure consistent results.
 */
function countSolutions(board: Board): number {
  const copy = cloneBoard(board);
  let count = 0;

  function solve(): boolean {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (copy[r][c] === 0) {
          for (let num = 1; num <= 9; num++) {
            if (isValid(copy, r, c, num)) {
              copy[r][c] = num;
              if (solve()) return true;
              copy[r][c] = 0;
            }
          }
          return false;
        }
      }
    }
    count++;
    return count >= 2; // stop at 2 — we only care about uniqueness
  }

  solve();
  return count;
}

// ---- Generator ----

/**
 * Fill a board completely with a valid solution using randomized backtracking.
 */
function fillBoard(board: Board): boolean {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c] === 0) {
        const nums = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
        for (const num of nums) {
          if (isValid(board, r, c, num)) {
            board[r][c] = num;
            if (fillBoard(board)) return true;
            board[r][c] = 0;
          }
        }
        return false;
      }
    }
  }
  return true; // all cells filled
}

/**
 * Generate a complete valid Sudoku solution, then remove cells
 * to create a puzzle with a unique solution.
 *
 * @param difficulty - 'easy' | 'medium' | 'hard'
 * @returns { puzzle: Board, solution: Board }
 */
export function generateSudoku(difficulty: Difficulty): {
  puzzle: Board;
  solution: Board;
} {
  // Step 1: Generate a complete valid board
  const solution = emptyBoard();
  fillBoard(solution);

  // Step 2: Clone and remove cells
  const puzzle = cloneBoard(solution);
  const removeTarget = REMOVE_COUNT[difficulty];

  // Create a shuffled list of all 81 positions
  const positions: [number, number][] = [];
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      positions.push([r, c]);
    }
  }
  shuffle(positions);

  let removed = 0;
  for (const [r, c] of positions) {
    if (removed >= removeTarget) break;

    const backup = puzzle[r][c];
    puzzle[r][c] = 0;

    // Check uniqueness — puzzle must have exactly 1 solution
    if (countSolutions(puzzle) !== 1) {
      puzzle[r][c] = backup; // restore — removing this cell breaks uniqueness
    } else {
      removed++;
    }
  }

  return { puzzle, solution };
}

// ---- Utility: Conflict detection ----

export interface ConflictMap {
  [key: string]: boolean; // "row-col" → true if conflicted
}

/**
 * Detect all cells that have duplicate values in their
 * row, column, or 3x3 box.
 */
export function findConflicts(board: Board): ConflictMap {
  const conflicts: ConflictMap = {};

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const val = board[r][c];
      if (val === 0) continue;

      let hasConflict = false;

      // Row check
      for (let cc = 0; cc < 9; cc++) {
        if (cc !== c && board[r][cc] === val) { hasConflict = true; break; }
      }
      if (!hasConflict) {
        // Column check
        for (let rr = 0; rr < 9; rr++) {
          if (rr !== r && board[rr][c] === val) { hasConflict = true; break; }
        }
      }
      if (!hasConflict) {
        // 3x3 box check
        const br = Math.floor(r / 3) * 3;
        const bc = Math.floor(c / 3) * 3;
        for (let rr = br; rr < br + 3 && !hasConflict; rr++) {
          for (let cc = bc; cc < bc + 3 && !hasConflict; cc++) {
            if ((rr !== r || cc !== c) && board[rr][cc] === val) {
              hasConflict = true;
            }
          }
        }
      }

      if (hasConflict) conflicts[`${r}-${c}`] = true;
    }
  }

  return conflicts;
}

/**
 * Check if the board is completely and correctly filled.
 */
export function isBoardComplete(board: Board): boolean {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c] === 0) return false;
    }
  }
  // No empties — check no conflicts
  return Object.keys(findConflicts(board)).length === 0;
}
