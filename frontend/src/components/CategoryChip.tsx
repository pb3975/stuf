import React from 'react';
import { categoryDot } from '@/lib/categoryColor';

interface Props {
  category: string;
  onClick?: () => void;
  active?: boolean;
  count?: number;
}

const CategoryChip: React.FC<Props> = ({ category, onClick, active, count }) => {
  return (
    <span
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-full border text-xs font-medium whitespace-nowrap"
      style={{
        padding: '4px 9px',
        cursor: onClick ? 'pointer' : 'default',
        background: active ? 'hsl(var(--foreground))' : 'hsl(var(--muted))',
        color: active ? 'hsl(var(--background))' : 'hsl(var(--muted-foreground))',
        borderColor: active ? 'hsl(var(--foreground))' : 'hsl(var(--border))',
        letterSpacing: '-0.005em',
        lineHeight: 1.2,
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: 2,
          background: categoryDot(category),
          flexShrink: 0,
        }}
      />
      {category}
      {typeof count === 'number' && (
        <span
          className="font-mono"
          style={{ fontSize: 10, opacity: 0.7, marginLeft: 2 }}
        >
          {count}
        </span>
      )}
    </span>
  );
};

export default CategoryChip;
