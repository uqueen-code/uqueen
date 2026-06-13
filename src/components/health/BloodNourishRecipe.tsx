'use client';

import { Soup, ChefHat, List, Sparkles, Heart } from 'lucide-react';

interface Recipe {
  name: string;
  ingredients: string;
  method: string;
  benefit: string;
  icon: string;
}

interface BloodNourishRecipeProps {
  recipe: Recipe;
}

export function BloodNourishRecipe({ recipe }: BloodNourishRecipeProps) {
  return (
    <div className="module-card" style={{ '--module-accent': '#ef4444' } as React.CSSProperties}>
      <h2 className="section-title" style={{ '--module-accent': '#ef4444' } as React.CSSProperties}>
        <Soup className="h-5 w-5" style={{ color: '#ef4444' }} />
        补气血食谱
      </h2>

      <div className="p-4 rounded-xl mb-3" style={{
        background: 'linear-gradient(135deg, rgba(239,68,68,0.08), rgba(249,115,22,0.08))',
        border: '1px solid rgba(239,68,68,0.15)',
      }}>
        <div className="flex items-center gap-3 mb-3">
          <span className="text-3xl">{recipe.icon}</span>
          <div>
            <h3 className="text-base font-bold" style={{ color: '#dc2626' }}>{recipe.name}</h3>
            <div className="flex items-center gap-1 mt-0.5">
              <Heart className="h-3 w-3" style={{ color: '#ef4444' }} />
              <span className="text-[10px]" style={{ color: '#ef4444' }}>每日一荐 · 补气养血</span>
            </div>
          </div>
        </div>

        {/* Ingredients */}
        <div className="mb-3 p-3 rounded-lg" style={{ background: 'var(--color-surface)' }}>
          <div className="flex items-center gap-1.5 mb-1.5">
            <List className="h-3.5 w-3.5" style={{ color: '#f97316' }} />
            <span className="text-xs font-medium" style={{ color: '#f97316' }}>所需食材</span>
          </div>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
            {recipe.ingredients}
          </p>
        </div>

        {/* Method */}
        <div className="mb-3 p-3 rounded-lg" style={{ background: 'var(--color-surface)' }}>
          <div className="flex items-center gap-1.5 mb-1.5">
            <ChefHat className="h-3.5 w-3.5" style={{ color: '#f97316' }} />
            <span className="text-xs font-medium" style={{ color: '#f97316' }}>做法</span>
          </div>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
            {recipe.method}
          </p>
        </div>

        {/* Benefit */}
        <div className="p-3 rounded-lg" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
          <div className="flex items-center gap-1.5 mb-1">
            <Sparkles className="h-3.5 w-3.5" style={{ color: '#22c55e' }} />
            <span className="text-xs font-medium" style={{ color: '#16a34a' }}>功效</span>
          </div>
          <p className="text-xs leading-relaxed" style={{ color: '#16a34a' }}>
            {recipe.benefit}
          </p>
        </div>
      </div>
    </div>
  );
}
