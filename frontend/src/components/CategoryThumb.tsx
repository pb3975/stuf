import React from 'react';
import { useTheme } from 'next-themes';
import { categorySwatch, categoryInk } from '@/lib/categoryColor';

interface Props {
  category: string;
  size?: number;
  radius?: number;
  imageUrl?: string;
  alt?: string;
}

const CategoryThumb: React.FC<Props> = ({ category, size = 40, radius = 8, imageUrl, alt }) => {
  const { resolvedTheme } = useTheme();
  const dark = resolvedTheme === 'dark';
  const bg = categorySwatch(category, dark);
  const ink = categoryInk(category, dark);
  const label = (category || '').slice(0, 3).toUpperCase();

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={alt || category}
        style={{ width: size, height: size, borderRadius: radius, objectFit: 'cover', flexShrink: 0 }}
      />
    );
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        background: bg,
        color: ink,
        display: 'grid',
        placeItems: 'center',
        flexShrink: 0,
        position: 'relative',
        overflow: 'hidden',
        border: `1px solid ${dark ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.04)'}`,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `repeating-linear-gradient(135deg, transparent 0 6px, ${
            dark ? 'rgba(255,255,255,.04)' : 'rgba(0,0,0,.025)'
          } 6px 7px)`,
        }}
      />
      <span
        className="font-mono"
        style={{
          fontSize: Math.max(9, size * 0.22),
          fontWeight: 500,
          letterSpacing: '0.04em',
          position: 'relative',
          opacity: 0.85,
        }}
      >
        {label}
      </span>
    </div>
  );
};

export default CategoryThumb;
