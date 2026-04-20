import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from './theme-toggle';
import { Plus, Bug } from 'lucide-react';

const Navbar: React.FC = () => {
  return (
    <nav
      className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      style={{ borderColor: 'var(--line-soft)' }}
    >
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex h-14 items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div
              className="grid place-items-center font-bold"
              style={{
                width: 28,
                height: 28,
                borderRadius: 7,
                background: 'hsl(var(--foreground))',
                color: 'hsl(var(--background))',
                fontSize: 14,
                letterSpacing: '-0.02em',
              }}
            >
              s
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-[15px] font-semibold tracking-tight">stuf</span>
              <span
                className="font-mono hidden sm:inline"
                style={{ fontSize: 10, color: 'var(--fg-dim)' }}
              >
                local-first inventory
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <Button asChild size="sm" variant="default" className="h-9">
              <Link to="/add">
                <Plus className="h-4 w-4 mr-1.5" />
                <span className="hidden sm:inline">Add item</span>
                <span className="sm:hidden">Add</span>
              </Link>
            </Button>
            <Button asChild variant="ghost" size="icon" className="h-9 w-9" aria-label="Debug">
              <Link to="/debug">
                <Bug className="h-4 w-4" />
              </Link>
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
