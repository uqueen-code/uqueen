'use client';

import { SudokuGame } from '@/components/sudoku/SudokuGame';

/**
 * 数独挑战页面
 */
export default function SudokuPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 animate-fade-in">
      <SudokuGame />
    </div>
  );
}
