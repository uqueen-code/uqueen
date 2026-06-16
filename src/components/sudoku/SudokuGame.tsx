'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import {
  generateSudoku,
  findConflicts,
  isBoardComplete,
  type Board,
  type Difficulty,
} from './sudokuGenerator';

// ---- Difficulty labels ----
const DIFFICULTY_CONFIG: { key: Difficulty; label: string; emoji: string }[] = [
  { key: 'easy', label: '初级', emoji: '🌱' },
  { key: 'medium', label: '中级', emoji: '🔥' },
  { key: 'hard', label: '高级', emoji: '💀' },
];

// ---- Types ----
interface Position {
  row: number;
  col: number;
}

// ---- Component ----

export function SudokuGame() {
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [puzzle, setPuzzle] = useState<Board | null>(null);
  const [solution, setSolution] = useState<Board | null>(null);
  const [board, setBoard] = useState<Board | null>(null);
  const [given, setGiven] = useState<boolean[][] | null>(null); // true = pre-filled
  const [selected, setSelected] = useState<Position | null>(null);
  const [conflicts, setConflicts] = useState<Record<string, boolean>>({});
  const [isWon, setIsWon] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  // ---- Start a new game ----
  const startGame = useCallback((diff: Difficulty) => {
    const { puzzle: p, solution: s } = generateSudoku(diff);
    setPuzzle(p);
    setSolution(s);
    setBoard(p.map(row => [...row]));
    setGiven(p.map(row => row.map(v => v !== 0)));
    setSelected(null);
    setConflicts({});
    setIsWon(false);
    setTimer(0);
    setIsRunning(true);
    setDifficulty(diff);
  }, []);

  // Auto-start on mount
  useEffect(() => {
    startGame('easy');
  }, [startGame]);

  // ---- Timer ----
  useEffect(() => {
    if (!isRunning || isWon) return;
    const id = setInterval(() => setTimer(t => t + 1), 1000);
    return () => clearInterval(id);
  }, [isRunning, isWon]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  // ---- Place a number ----
  const placeNumber = useCallback((num: number) => {
    if (!board || !given || !selected || isWon) return;
    const { row, col } = selected;
    if (given[row][col]) return; // can't change pre-filled cells

    const newBoard = board.map(r => [...r]);
    newBoard[row][col] = num;
    setBoard(newBoard);

    // Update conflicts
    const newConflicts = findConflicts(newBoard);
    setConflicts(newConflicts);

    // Check win
    if (isBoardComplete(newBoard)) {
      setIsWon(true);
      setIsRunning(false);
    }
  }, [board, given, selected, isWon]);

  // ---- Erase ----
  const eraseCell = useCallback(() => {
    if (!board || !given || !selected || isWon) return;
    const { row, col } = selected;
    if (given[row][col]) return;

    const newBoard = board.map(r => [...r]);
    newBoard[row][col] = 0;
    setBoard(newBoard);
    setConflicts(findConflicts(newBoard));
  }, [board, given, selected, isWon]);

  // ---- Keyboard support ----
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!selected || isWon) return;
      const num = parseInt(e.key);
      if (num >= 1 && num <= 9) {
        placeNumber(num);
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        eraseCell();
      } else if (e.key === 'ArrowUp' && selected.row > 0) {
        setSelected({ ...selected, row: selected.row - 1 });
      } else if (e.key === 'ArrowDown' && selected.row < 8) {
        setSelected({ ...selected, row: selected.row + 1 });
      } else if (e.key === 'ArrowLeft' && selected.col > 0) {
        setSelected({ ...selected, col: selected.col - 1 });
      } else if (e.key === 'ArrowRight' && selected.col < 8) {
        setSelected({ ...selected, col: selected.row + 1 });
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [selected, isWon, placeNumber, eraseCell]);

  // ---- Highlighted cells ----
  const highlightedCells = useMemo(() => {
    const set = new Set<string>();
    if (!selected) return set;
    const { row, col } = selected;
    const boxR = Math.floor(row / 3) * 3;
    const boxC = Math.floor(col / 3) * 3;

    for (let i = 0; i < 9; i++) {
      set.add(`${row}-${i}`);   // same row
      set.add(`${i}-${col}`);   // same column
    }
    for (let r = boxR; r < boxR + 3; r++) {
      for (let c = boxC; c < boxC + 3; c++) {
        set.add(`${r}-${c}`);   // same box
      }
    }
    return set;
  }, [selected]);

  // ---- Same-number highlight ----
  const sameNumberCells = useMemo(() => {
    const set = new Set<string>();
    if (!selected || !board) return set;
    const val = board[selected.row][selected.col];
    if (val === 0) return set;
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (board[r][c] === val) set.add(`${r}-${c}`);
      }
    }
    return set;
  }, [selected, board]);

  // ---- Count remaining for each number ----
  const numberCounts = useMemo(() => {
    if (!board) return {};
    const counts: Record<number, number> = {};
    for (let n = 1; n <= 9; n++) counts[n] = 0;
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const v = board[r][c];
        if (v >= 1 && v <= 9) counts[v]++;
      }
    }
    return counts;
  }, [board]);

  // ---- Loading guard ----
  if (!board || !given || !puzzle || !solution) {
    return (
      <div className="flex items-center justify-center min-h-[400px]" style={{ color: 'var(--color-text-muted)' }}>
        正在生成数独...
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-3 py-4 select-none">
      {/* ---- Header ---- */}
      <div className="text-center mb-4">
        <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--color-text-primary)' }}>
          🧩 数独挑战
        </h1>
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          用逻辑填满 9×9 的格子
        </p>
      </div>

      {/* ---- Difficulty Selector ---- */}
      <div className="flex justify-center gap-2 mb-4">
        {DIFFICULTY_CONFIG.map(d => (
          <button
            key={d.key}
            onClick={() => startGame(d.key)}
            className="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
            style={{
              background: difficulty === d.key
                ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                : 'var(--color-surface-hover)',
              color: difficulty === d.key ? '#fff' : 'var(--color-text-secondary)',
              boxShadow: difficulty === d.key ? '0 4px 12px rgba(99,102,241,0.3)' : 'none',
              transform: difficulty === d.key ? 'scale(1.05)' : 'scale(1)',
            }}
          >
            {d.emoji} {d.label}
          </button>
        ))}
      </div>

      {/* ---- Timer & New Game ---- */}
      <div className="flex items-center justify-between mb-3 px-1">
        <span className="text-sm font-mono font-medium" style={{ color: 'var(--color-text-secondary)' }}>
          ⏱ {formatTime(timer)}
        </span>
        <button
          onClick={() => startGame(difficulty)}
          className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-80"
          style={{ background: 'var(--color-surface-hover)', color: 'var(--color-text-secondary)' }}
        >
          🔄 新游戏
        </button>
      </div>

      {/* ---- 9×9 Grid ---- */}
      <div
        className="grid grid-cols-9 border-2 rounded-xl overflow-hidden mb-4"
        style={{
          borderColor: 'var(--color-text-primary)',
          background: 'var(--color-surface-hover)',
          aspectRatio: '1 / 1',
        }}
      >
        {board.map((row, r) =>
          row.map((cell, c) => {
            const key = `${r}-${c}`;
            const isSelected = selected?.row === r && selected?.col === c;
            const isHighlighted = highlightedCells.has(key);
            const isSameNum = sameNumberCells.has(key);
            const isConflict = conflicts[key];
            const isGivenCell = given[r][c];

            // Border logic: thick borders for 3x3 box boundaries
            const borderRight = (c + 1) % 3 === 0 && c < 8 ? '2px solid var(--color-text-primary)' : '1px solid var(--color-border)';
            const borderBottom = (r + 1) % 3 === 0 && r < 8 ? '2px solid var(--color-text-primary)' : '1px solid var(--color-border)';

            // Background color logic (priority: selected > same-number > highlighted > default)
            let bg = 'transparent';
            if (isSelected) {
              bg = 'rgba(99,102,241,0.25)';
            } else if (isSameNum) {
              bg = 'rgba(139,92,246,0.15)';
            } else if (isHighlighted) {
              bg = 'rgba(99,102,241,0.08)';
            }

            // Text color
            let textColor = 'var(--color-text-primary)';
            if (isConflict) textColor = '#ef4444';       // red for conflicts
            else if (!isGivenCell) textColor = '#6366f1'; // indigo for user input

            return (
              <div
                key={key}
                onClick={() => setSelected({ row: r, col: c })}
                className="flex items-center justify-center cursor-pointer transition-colors duration-100"
                style={{
                  borderRight,
                  borderBottom,
                  background: bg,
                  color: textColor,
                  fontWeight: isGivenCell ? 700 : 500,
                  fontSize: 'clamp(14px, 4vw, 22px)',
                }}
              >
                {cell !== 0 ? cell : ''}
              </div>
            );
          })
        )}
      </div>

      {/* ---- Number Pad ---- */}
      <div className="grid grid-cols-5 gap-2 mb-3">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => {
          const remaining = 9 - (numberCounts[num] ?? 0);
          const isDepleted = remaining <= 0;
          return (
            <button
              key={num}
              onClick={() => placeNumber(num)}
              disabled={isDepleted}
              className="flex flex-col items-center justify-center py-2.5 rounded-xl text-lg font-bold transition-all duration-150"
              style={{
                background: isDepleted
                  ? 'var(--color-surface-hover)'
                  : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: isDepleted ? 'var(--color-text-muted)' : '#fff',
                opacity: isDepleted ? 0.4 : 1,
                transform: isDepleted ? 'scale(0.95)' : 'scale(1)',
                boxShadow: isDepleted ? 'none' : '0 2px 8px rgba(99,102,241,0.25)',
              }}
            >
              {num}
              <span className="text-[9px] font-normal opacity-70">
                {isDepleted ? '✓' : `剩${remaining}`}
              </span>
            </button>
          );
        })}
        {/* Eraser button */}
        <button
          onClick={eraseCell}
          className="flex flex-col items-center justify-center py-2.5 rounded-xl text-lg font-bold transition-all duration-150"
          style={{
            background: 'var(--color-surface-hover)',
            color: 'var(--color-text-secondary)',
          }}
        >
          🧹
          <span className="text-[9px] font-normal opacity-70">擦除</span>
        </button>
      </div>

      {/* ---- Hint ---- */}
      <p className="text-center text-xs" style={{ color: 'var(--color-text-muted)' }}>
        点击格子 → 选数字 ｜ 方向键移动 ｜ Backspace 擦除
      </p>

      {/* ---- Victory Modal ---- */}
      {isWon && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center animate-fade-in"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}
        >
          <div
            className="max-w-sm w-full mx-4 rounded-2xl p-8 text-center animate-slide-up"
            style={{
              background: 'var(--color-surface)',
              border: '2px solid var(--color-accent)',
              boxShadow: '0 20px 60px rgba(99,102,241,0.3)',
            }}
          >
            {/* Dancing Kirby */}
            <div className="text-6xl mb-4 animate-bounce">🐧</div>
            <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
              🎉 挑战成功！
            </h2>
            <p className="text-lg font-semibold mb-1" style={{ color: '#6366f1' }}>
              脑力值 +10！
            </p>
            <p className="text-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>
              用时 {formatTime(timer)} · {
                difficulty === 'easy' ? '初级' : difficulty === 'medium' ? '中级' : '高级'
              }难度
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => startGame(difficulty)}
                className="px-6 py-2.5 rounded-xl text-sm font-medium text-white transition-all hover:scale-105"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
              >
                再来一局
              </button>
              <button
                onClick={() => {
                  const nextDiff: Difficulty = difficulty === 'easy' ? 'medium' : difficulty === 'medium' ? 'hard' : 'hard';
                  startGame(nextDiff);
                }}
                className="px-6 py-2.5 rounded-xl text-sm font-medium transition-all hover:scale-105"
                style={{ background: 'var(--color-surface-hover)', color: 'var(--color-text-secondary)' }}
              >
                挑战更难
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
