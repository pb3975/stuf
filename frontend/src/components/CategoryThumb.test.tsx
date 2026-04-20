import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CategoryThumb from './CategoryThumb';

vi.mock('next-themes', () => ({
  useTheme: () => ({ resolvedTheme: 'light' }),
}));

describe('CategoryThumb', () => {
  it('renders the first 3 characters of the category in uppercase', () => {
    const { container } = render(<CategoryThumb category="Tools" />);
    expect(container.textContent).toContain('TOO');
  });

  it('renders an <img> when imageUrl is provided', () => {
    const { container } = render(
      <CategoryThumb category="Tools" imageUrl="/uploads/foo.jpg" alt="Drill" />,
    );
    const img = container.querySelector('img');
    expect(img).not.toBeNull();
    expect(img?.getAttribute('src')).toBe('/uploads/foo.jpg');
    expect(img?.getAttribute('alt')).toBe('Drill');
  });

  it('applies the given size', () => {
    const { container } = render(<CategoryThumb category="Kitchen" size={64} />);
    const thumb = container.firstChild as HTMLElement;
    expect(thumb.style.width).toBe('64px');
    expect(thumb.style.height).toBe('64px');
  });
});
