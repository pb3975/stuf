import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import type { Item } from '../types/Item';
import type { ApiError } from '../types/api-error';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Search,
  SortAsc,
  X,
  CheckSquare,
  Square,
  Trash2,
  Edit3,
  Download,
  Plus,
  Minus,
  LayoutList,
  LayoutGrid,
  ChevronRight,
  MapPin,
} from 'lucide-react';
import { getApiUrl, getAssetUrl } from '../lib/config';
import { categoryDot, categorySwatch, categoryInk } from '@/lib/categoryColor';
import CategoryThumb from './CategoryThumb';

type SortOption = 'name-asc' | 'name-desc' | 'quantity-asc' | 'quantity-desc' | 'category-asc' | 'category-desc';
type ViewMode = 'list' | 'grid';

const ItemList: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('name-asc');
  const [minQuantity, setMinQuantity] = useState<string>('');
  const [maxQuantity, setMaxQuantity] = useState<string>('');
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const saved = typeof window !== 'undefined' ? window.localStorage.getItem('stuf-view-mode') : null;
    return saved === 'grid' ? 'grid' : 'list';
  });

  // Bulk operations state
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [bulkMode, setBulkMode] = useState<boolean>(false);
  const [bulkCategory, setBulkCategory] = useState<string>('');
  const [bulkQuantityChange, setBulkQuantityChange] = useState<string>('');
  const [isProcessingBulk, setIsProcessingBulk] = useState<boolean>(false);

  useEffect(() => {
    window.localStorage.setItem('stuf-view-mode', viewMode);
  }, [viewMode]);

  const fetchItems = async () => {
    try {
      const response = await axios.get(getApiUrl('/items/'));
      setItems(response.data);
    } catch (error) {
      console.error('Error fetching items:', error);
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as ApiError;
        if (axiosError.response) {
          console.error('Response status:', axiosError.response.status);
        }
      }
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(getApiUrl('/categories/'));
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchItems();
    fetchCategories();
  }, []);

  const filteredAndSortedItems = useMemo(() => {
    let filtered = items;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((item) => {
        const nameMatch = item.name.toLowerCase().includes(query);
        const categoryMatch = item.category.toLowerCase().includes(query);
        const attributeMatch = Object.entries(item.custom_attributes || {}).some(
          ([key, value]) =>
            key.toLowerCase().includes(query) || String(value).toLowerCase().includes(query),
        );
        return nameMatch || categoryMatch || attributeMatch;
      });
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter((item) => item.category === selectedCategory);
    }

    const minQty = minQuantity ? parseInt(minQuantity) : undefined;
    const maxQty = maxQuantity ? parseInt(maxQuantity) : undefined;

    if (minQty !== undefined) filtered = filtered.filter((item) => item.quantity >= minQty);
    if (maxQty !== undefined) filtered = filtered.filter((item) => item.quantity <= maxQty);

    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'quantity-asc':
          return a.quantity - b.quantity;
        case 'quantity-desc':
          return b.quantity - a.quantity;
        case 'category-asc':
          return a.category.localeCompare(b.category);
        case 'category-desc':
          return b.category.localeCompare(a.category);
        default:
          return 0;
      }
    });
    return sorted;
  }, [items, searchQuery, selectedCategory, sortBy, minQuantity, maxQuantity]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setMinQuantity('');
    setMaxQuantity('');
    setSortBy('name-asc');
  };

  const hasActiveFilters =
    searchQuery || selectedCategory !== 'all' || minQuantity || maxQuantity || sortBy !== 'name-asc';

  const toggleBulkMode = () => {
    setBulkMode(!bulkMode);
    setSelectedItems(new Set());
  };

  const toggleItemSelection = (itemId: number, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    const newSelection = new Set(selectedItems);
    if (newSelection.has(itemId)) newSelection.delete(itemId);
    else newSelection.add(itemId);
    setSelectedItems(newSelection);
  };

  const selectAllVisible = () =>
    setSelectedItems(new Set(filteredAndSortedItems.map((item) => item.id)));
  const deselectAll = () => setSelectedItems(new Set());

  const exportToCSV = () => {
    const selectedItemsData = items.filter((item) => selectedItems.has(item.id));
    const csvHeaders = ['Name', 'Category', 'Quantity', 'Custom Attributes'];
    const csvRows = selectedItemsData.map((item) => [
      item.name,
      item.category,
      item.quantity.toString(),
      JSON.stringify(item.custom_attributes || {}),
    ]);
    const csvContent = [csvHeaders, ...csvRows]
      .map((row) => row.map((field) => `"${field.replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `inventory-export-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const bulkDelete = async () => {
    setIsProcessingBulk(true);
    try {
      await Promise.all(
        Array.from(selectedItems).map((itemId) => axios.delete(getApiUrl(`/items/${itemId}`))),
      );
      await fetchItems();
      setSelectedItems(new Set());
      setBulkMode(false);
    } catch (error) {
      console.error('Bulk delete failed:', error);
    } finally {
      setIsProcessingBulk(false);
    }
  };

  const bulkUpdateCategory = async () => {
    if (!bulkCategory) return;
    setIsProcessingBulk(true);
    try {
      const selectedItemsData = items.filter((item) => selectedItems.has(item.id));
      await Promise.all(
        selectedItemsData.map((item) =>
          axios.put(getApiUrl(`/items/${item.id}`), { ...item, category: bulkCategory }),
        ),
      );
      await fetchItems();
      setSelectedItems(new Set());
      setBulkCategory('');
    } catch (error) {
      console.error('Bulk category update failed:', error);
    } finally {
      setIsProcessingBulk(false);
    }
  };

  const bulkUpdateQuantity = async (operation: 'add' | 'subtract' | 'set') => {
    const changeValue = parseInt(bulkQuantityChange);
    if (isNaN(changeValue)) return;
    setIsProcessingBulk(true);
    try {
      const selectedItemsData = items.filter((item) => selectedItems.has(item.id));
      await Promise.all(
        selectedItemsData.map((item) => {
          let newQuantity: number;
          switch (operation) {
            case 'add':
              newQuantity = item.quantity + changeValue;
              break;
            case 'subtract':
              newQuantity = Math.max(0, item.quantity - changeValue);
              break;
            case 'set':
              newQuantity = changeValue;
              break;
            default:
              newQuantity = item.quantity;
          }
          return axios.put(getApiUrl(`/items/${item.id}`), { ...item, quantity: newQuantity });
        }),
      );
      await fetchItems();
      setSelectedItems(new Set());
      setBulkQuantityChange('');
    } catch (error) {
      console.error('Bulk quantity update failed:', error);
    } finally {
      setIsProcessingBulk(false);
    }
  };

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    items.forEach((i) => {
      counts[i.category] = (counts[i.category] || 0) + 1;
    });
    return counts;
  }, [items]);

  return (
    <div className="container mx-auto p-4 sm:p-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Inventory</h1>
          <p className="text-sm text-muted-foreground mt-1">
            <span className="font-mono text-foreground font-medium">
              {filteredAndSortedItems.length}
            </span>{' '}
            of{' '}
            <span className="font-mono">{items.length}</span> item
            {items.length !== 1 ? 's' : ''}
            {hasActiveFilters && ' · filtered'}
            {selectedItems.size > 0 && (
              <span style={{ color: 'var(--accent-ink)' }}>
                {' · '}
                <span className="font-mono">{selectedItems.size}</span> selected
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Search + filters row */}
      <div className="flex flex-col lg:flex-row gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, category, or attribute…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-9"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-40 h-9">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
            <SelectTrigger className="w-36 h-9">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name-asc">Name A-Z</SelectItem>
              <SelectItem value="name-desc">Name Z-A</SelectItem>
              <SelectItem value="quantity-asc">Qty Low-High</SelectItem>
              <SelectItem value="quantity-desc">Qty High-Low</SelectItem>
              <SelectItem value="category-asc">Category A-Z</SelectItem>
              <SelectItem value="category-desc">Category Z-A</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center">
            <Input
              placeholder="Min"
              type="number"
              value={minQuantity}
              onChange={(e) => setMinQuantity(e.target.value)}
              className="w-16 h-9 text-xs"
              min="0"
            />
            <span className="mx-1 text-muted-foreground text-xs">–</span>
            <Input
              placeholder="Max"
              type="number"
              value={maxQuantity}
              onChange={(e) => setMaxQuantity(e.target.value)}
              className="w-16 h-9 text-xs"
              min="0"
            />
          </div>
        </div>
      </div>

      {/* Category chip strip */}
      {categories.length > 0 && (
        <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1">
          <button
            onClick={() => setSelectedCategory('all')}
            className="inline-flex items-center gap-1.5 rounded-full border text-xs font-medium whitespace-nowrap px-2.5 py-1"
            style={{
              background:
                selectedCategory === 'all' ? 'hsl(var(--foreground))' : 'hsl(var(--muted))',
              color:
                selectedCategory === 'all' ? 'hsl(var(--background))' : 'hsl(var(--muted-foreground))',
              borderColor:
                selectedCategory === 'all' ? 'hsl(var(--foreground))' : 'hsl(var(--border))',
            }}
          >
            All <span className="font-mono opacity-70">{items.length}</span>
          </button>
          {categories.map((c) => {
            const active = selectedCategory === c;
            return (
              <button
                key={c}
                onClick={() => setSelectedCategory(active ? 'all' : c)}
                className="inline-flex items-center gap-1.5 rounded-full border text-xs font-medium whitespace-nowrap px-2.5 py-1"
                style={{
                  background: active ? 'hsl(var(--foreground))' : 'hsl(var(--muted))',
                  color: active ? 'hsl(var(--background))' : 'hsl(var(--muted-foreground))',
                  borderColor: active ? 'hsl(var(--foreground))' : 'hsl(var(--border))',
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 2,
                    background: categoryDot(c),
                  }}
                />
                {c}
                <span className="font-mono opacity-70">{categoryCounts[c] ?? 0}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Action bar: view toggle + bulk */}
      <div className="flex items-center gap-2 mb-4">
        {hasActiveFilters && (
          <Button variant="outline" size="sm" onClick={clearFilters} className="h-8">
            <X className="h-3 w-3 mr-1" />
            Clear
          </Button>
        )}
        <div className="ml-auto flex items-center gap-2">
          {!bulkMode && (
            <div
              className="inline-flex p-0.5 rounded-md border"
              style={{ background: 'hsl(var(--muted))' }}
            >
              <button
                onClick={() => setViewMode('list')}
                title="List view"
                className="w-7 h-7 grid place-items-center rounded-sm"
                style={{
                  background: viewMode === 'list' ? 'hsl(var(--card))' : 'transparent',
                  color: viewMode === 'list' ? 'hsl(var(--foreground))' : 'var(--fg-dim)',
                  boxShadow: viewMode === 'list' ? '0 1px 2px rgba(0,0,0,0.04)' : 'none',
                }}
              >
                <LayoutList className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                title="Grid view"
                className="w-7 h-7 grid place-items-center rounded-sm"
                style={{
                  background: viewMode === 'grid' ? 'hsl(var(--card))' : 'transparent',
                  color: viewMode === 'grid' ? 'hsl(var(--foreground))' : 'var(--fg-dim)',
                  boxShadow: viewMode === 'grid' ? '0 1px 2px rgba(0,0,0,0.04)' : 'none',
                }}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
          <Button
            variant={bulkMode ? 'default' : 'outline'}
            size="sm"
            onClick={toggleBulkMode}
            className="h-8"
          >
            {bulkMode ? (
              <CheckSquare className="h-3 w-3 mr-1" />
            ) : (
              <Square className="h-3 w-3 mr-1" />
            )}
            {bulkMode ? 'Done' : 'Select'}
          </Button>
        </div>
      </div>

      {/* Bulk toolbar */}
      {bulkMode && selectedItems.size > 0 && (
        <div
          className="rounded-lg p-3 sm:p-4 mb-4 space-y-3"
          style={{
            background: 'var(--accent-bg)',
            border: '1px solid hsl(var(--border))',
          }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium" style={{ color: 'var(--accent-ink)' }}>
                <span className="font-mono">{selectedItems.size}</span> selected
              </span>
              <Button variant="outline" size="sm" onClick={selectAllVisible} className="h-8">
                All visible ({filteredAndSortedItems.length})
              </Button>
              <Button variant="outline" size="sm" onClick={deselectAll} className="h-8">
                Clear
              </Button>
            </div>
            <Button variant="outline" size="sm" onClick={exportToCSV} className="h-8">
              <Download className="h-3 w-3 mr-1" />
              Export CSV
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Change category</label>
              <div className="flex gap-1">
                <Select value={bulkCategory} onValueChange={setBulkCategory}>
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="New category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  size="sm"
                  onClick={bulkUpdateCategory}
                  disabled={!bulkCategory || isProcessingBulk}
                  className="h-8"
                >
                  <Edit3 className="h-3 w-3" />
                </Button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Adjust quantity</label>
              <div className="flex gap-1">
                <Input
                  type="number"
                  placeholder="Amount"
                  value={bulkQuantityChange}
                  onChange={(e) => setBulkQuantityChange(e.target.value)}
                  className="h-8 text-xs"
                  min="0"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => bulkUpdateQuantity('add')}
                  disabled={!bulkQuantityChange || isProcessingBulk}
                  className="h-8 px-2"
                >
                  <Plus className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => bulkUpdateQuantity('subtract')}
                  disabled={!bulkQuantityChange || isProcessingBulk}
                  className="h-8 px-2"
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => bulkUpdateQuantity('set')}
                  disabled={!bulkQuantityChange || isProcessingBulk}
                  className="h-8 px-2"
                >
                  =
                </Button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Delete</label>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={isProcessingBulk}
                    className="h-8 w-full"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete selected
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete selected items</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete {selectedItems.size} selected item
                      {selectedItems.size !== 1 ? 's' : ''}? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={bulkDelete}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {isProcessingBulk ? 'Deleting…' : 'Delete'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      )}

      {/* List or Grid */}
      {viewMode === 'list' ? (
        <ListView
          items={filteredAndSortedItems}
          bulkMode={bulkMode}
          selectedItems={selectedItems}
          onToggleSelection={toggleItemSelection}
        />
      ) : (
        <GridView
          items={filteredAndSortedItems}
          bulkMode={bulkMode}
          selectedItems={selectedItems}
          onToggleSelection={toggleItemSelection}
        />
      )}

      {filteredAndSortedItems.length === 0 && (
        <div className="text-center py-16">
          <p className="text-muted-foreground mb-4">
            {items.length === 0
              ? 'No items yet.'
              : hasActiveFilters
              ? 'No items match your filters.'
              : 'No items found.'}
          </p>
          {items.length === 0 ? (
            <Button asChild>
              <Link to="/add">Add your first item</Link>
            </Button>
          ) : hasActiveFilters ? (
            <Button variant="outline" onClick={clearFilters}>
              Clear filters
            </Button>
          ) : (
            <Button asChild>
              <Link to="/add">Add item</Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

interface ViewProps {
  items: Item[];
  bulkMode: boolean;
  selectedItems: Set<number>;
  onToggleSelection: (id: number, e: React.MouseEvent) => void;
}

const ListView: React.FC<ViewProps> = ({ items, bulkMode, selectedItems, onToggleSelection }) => {
  const gridCols = bulkMode
    ? '28px minmax(0,2fr) 120px 64px minmax(0,1.2fr) 32px'
    : 'minmax(0,2fr) 120px 64px minmax(0,1.2fr) 32px';

  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
    >
      <div
        className="px-3 py-2.5 text-[10px] font-semibold uppercase tracking-wider"
        style={{
          display: 'grid',
          gridTemplateColumns: gridCols,
          gap: 12,
          color: 'var(--fg-dim)',
          background: 'hsl(var(--muted))',
          borderBottom: '1px solid hsl(var(--border))',
        }}
      >
        {bulkMode && <span />}
        <span>Name</span>
        <span>Category</span>
        <span>Qty</span>
        <span>Attributes</span>
        <span />
      </div>
      {items.map((item, i) => {
        const isSel = selectedItems.has(item.id);
        const attrSummary = Object.entries(item.custom_attributes || {})
          .slice(0, 2)
          .map(([k, v]) => `${k}: ${v}`)
          .join(' · ');
        return (
          <Link
            key={item.id}
            to={bulkMode ? '#' : `/item/${item.id}`}
            onClick={(e) => {
              if (bulkMode) onToggleSelection(item.id, e);
            }}
            style={{
              display: 'grid',
              gridTemplateColumns: gridCols,
              gap: 12,
              padding: '10px 12px',
              alignItems: 'center',
              borderTop: i === 0 ? 'none' : '1px solid var(--line-soft)',
              background: isSel ? 'var(--accent-bg)' : 'transparent',
              cursor: 'pointer',
              textDecoration: 'none',
              color: 'inherit',
              transition: 'background 60ms',
            }}
            onMouseEnter={(e) => {
              if (!isSel) e.currentTarget.style.background = 'hsl(var(--muted))';
            }}
            onMouseLeave={(e) => {
              if (!isSel) e.currentTarget.style.background = 'transparent';
            }}
          >
            {bulkMode && (
              <span
                onClick={(e) => onToggleSelection(item.id, e)}
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: 4,
                  border: `1.5px solid ${isSel ? 'var(--accent-ink)' : 'hsl(var(--border))'}`,
                  background: isSel ? 'var(--accent-ink)' : 'transparent',
                  display: 'grid',
                  placeItems: 'center',
                  color: '#fff',
                }}
              >
                {isSel && '✓'}
              </span>
            )}
            <div className="flex items-center gap-3 min-w-0">
              <CategoryThumb
                category={item.category}
                size={32}
                radius={6}
                imageUrl={item.image_url ? getAssetUrl(item.image_url) : undefined}
                alt={item.name}
              />
              <div className="min-w-0">
                <div className="text-[13px] font-medium tracking-tight truncate">{item.name}</div>
                <div
                  className="font-mono text-[10px] mt-0.5"
                  style={{ color: 'var(--fg-dim)' }}
                >
                  STF-{String(item.id).padStart(4, '0')}
                </div>
              </div>
            </div>
            <div>
              <span
                className="inline-flex items-center gap-1.5 rounded-full text-[11px] font-medium"
                style={{
                  padding: '3px 8px',
                  background: 'hsl(var(--muted))',
                  color: 'hsl(var(--muted-foreground))',
                  border: '1px solid hsl(var(--border))',
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 2,
                    background: categoryDot(item.category),
                  }}
                />
                {item.category}
              </span>
            </div>
            <div className="font-mono text-[13px]">{item.quantity}</div>
            <div className="text-xs text-muted-foreground truncate">{attrSummary || '—'}</div>
            <div className="flex justify-end" style={{ color: 'var(--fg-dim)' }}>
              <ChevronRight className="h-4 w-4" />
            </div>
          </Link>
        );
      })}
    </div>
  );
};

const GridView: React.FC<ViewProps> = ({ items, bulkMode, selectedItems, onToggleSelection }) => {
  return (
    <div
      className="grid gap-3 sm:gap-4"
      style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}
    >
      {items.map((item) => {
        const isSel = selectedItems.has(item.id);
        const swatch = categorySwatch(item.category);
        const ink = categoryInk(item.category);
        return (
          <Link
            key={item.id}
            to={bulkMode ? '#' : `/item/${item.id}`}
            onClick={(e) => {
              if (bulkMode) onToggleSelection(item.id, e);
            }}
            className="relative rounded-xl overflow-hidden"
            style={{
              background: 'hsl(var(--card))',
              border: `1px solid ${isSel ? 'var(--accent-oklch)' : 'hsl(var(--border))'}`,
              boxShadow: isSel ? '0 0 0 3px var(--accent-bg)' : 'none',
              textDecoration: 'none',
              color: 'inherit',
              cursor: 'pointer',
            }}
          >
            {bulkMode && (
              <span
                onClick={(e) => onToggleSelection(item.id, e)}
                style={{
                  position: 'absolute',
                  top: 10,
                  left: 10,
                  zIndex: 2,
                  width: 20,
                  height: 20,
                  borderRadius: 5,
                  border: `1.5px solid ${isSel ? 'var(--accent-ink)' : 'hsl(var(--border))'}`,
                  background: isSel ? 'var(--accent-ink)' : 'hsl(var(--card))',
                  display: 'grid',
                  placeItems: 'center',
                  color: '#fff',
                  fontSize: 11,
                  fontWeight: 700,
                }}
              >
                {isSel && '✓'}
              </span>
            )}
            <div
              style={{
                aspectRatio: '4/3',
                background: item.image_url ? 'transparent' : swatch,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {item.image_url ? (
                <img
                  src={getAssetUrl(item.image_url)}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <>
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background:
                        'repeating-linear-gradient(135deg, transparent 0 10px, rgba(0,0,0,.025) 10px 11px)',
                    }}
                  />
                  <span
                    className="font-mono"
                    style={{
                      position: 'absolute',
                      bottom: 10,
                      left: 12,
                      fontSize: 9,
                      color: ink,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      fontWeight: 500,
                    }}
                  >
                    {item.category}
                  </span>
                  <span
                    className="font-mono"
                    style={{
                      position: 'absolute',
                      top: 10,
                      right: 12,
                      fontSize: 9,
                      color: ink,
                      opacity: 0.7,
                    }}
                  >
                    STF-{String(item.id).padStart(4, '0')}
                  </span>
                </>
              )}
            </div>
            <div className="p-3">
              <div className="text-[13px] font-medium tracking-tight mb-1 truncate">
                {item.name}
              </div>
              <div
                className="flex items-center gap-2 pt-2.5 mt-2.5"
                style={{ borderTop: '1px solid var(--line-soft)' }}
              >
                <span
                  className="text-[11px] flex items-center gap-1 flex-1 min-w-0 truncate"
                  style={{ color: 'hsl(var(--muted-foreground))' }}
                >
                  <MapPin className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{item.category}</span>
                </span>
                <span
                  className="font-mono text-[11px] font-medium"
                  style={{
                    padding: '2px 7px',
                    background: 'hsl(var(--muted))',
                    borderRadius: 5,
                  }}
                >
                  ×{item.quantity}
                </span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
};

// silence unused warning for lucide
void SortAsc;

export default ItemList;
