import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from './theme-toggle';
import { Plus, Bug } from 'lucide-react';

const Navbar: React.FC = () => {
  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 text-xl font-bold">
            <img src="/stuf-logo.png" alt="Stuf" className="h-8 w-8" />
            <span>Stuf</span>
          </Link>
          
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Button asChild className="h-9 sm:h-10">
              <Link to="/add">
                <Plus className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Add Item</span>
                <span className="sm:hidden">Add</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-9 sm:h-10">
              <Link to="/debug">
                <Bug className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Debug</span>
                <span className="sm:hidden">🔧</span>
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