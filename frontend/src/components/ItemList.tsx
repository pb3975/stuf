import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import type { Item } from '../types/Item';
import type { ApiError } from '../types/api-error';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardTitle,
} from '@/components/ui/card';
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
  SortDesc, 
  X, 
  CheckSquare, 
  Square, 
  Trash2, 
  Edit3, 
  Download,
  Plus,
  Minus
} from 'lucide-react';
import { getApiUrl, getAssetUrl } from '../lib/config';

type SortOption = 'name-asc' | 'name-desc' | 'quantity-asc' | 'quantity-desc' | 'category-asc' | 'category-desc';

const ItemList: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('name-asc');
  const [minQuantity, setMinQuantity] = useState<string>('');
  const [maxQuantity, setMaxQuantity] = useState<string>('');
  
  // Bulk operations state
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [bulkMode, setBulkMode] = useState<boolean>(false);
  const [bulkCategory, setBulkCategory] = useState<string>('');
  const [bulkQuantityChange, setBulkQuantityChange] = useState<string>('');
  const [isProcessingBulk, setIsProcessingBulk] = useState<boolean>(false);

    const fetchItems = async () => {
      try {
      console.log('📦 Fetching items...');
      const response = await axios.get(getApiUrl('/items/'));
      console.log('✅ Items fetched successfully:', response.data);
        setItems(response.data);
      } catch (error) {
      console.error('❌ Error fetching items:', error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
      }
      // Check if it's an axios error
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as ApiError;
        if (axiosError.response) {
          console.error('Response status:', axiosError.response.status);
          console.error('Response data:', axiosError.response.data);
        } else if (axiosError.request) {
          console.error('No response received:', axiosError.request);
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

  // Advanced filtering and sorting logic
  const filteredAndSortedItems = useMemo(() => {
    let filtered = items;

    // Text search across name, category, and custom attributes
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(item => {
        const nameMatch = item.name.toLowerCase().includes(query);
        const categoryMatch = item.category.toLowerCase().includes(query);
        
        // Search in custom attributes
        const attributeMatch = Object.entries(item.custom_attributes || {}).some(([key, value]) => 
          key.toLowerCase().includes(query) || 
          String(value).toLowerCase().includes(query)
        );
        
        return nameMatch || categoryMatch || attributeMatch;
      });
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    // Quantity range filter
    const minQty = minQuantity ? parseInt(minQuantity) : undefined;
    const maxQty = maxQuantity ? parseInt(maxQuantity) : undefined;
    
    if (minQty !== undefined) {
      filtered = filtered.filter(item => item.quantity >= minQty);
    }
    if (maxQty !== undefined) {
      filtered = filtered.filter(item => item.quantity <= maxQty);
    }

    // Sorting
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

  const hasActiveFilters = searchQuery || selectedCategory !== 'all' || minQuantity || maxQuantity || sortBy !== 'name-asc';

  // Bulk operations functions
  const toggleBulkMode = () => {
    setBulkMode(!bulkMode);
    setSelectedItems(new Set());
  };

  const toggleItemSelection = (itemId: number, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    const newSelection = new Set(selectedItems);
    if (newSelection.has(itemId)) {
      newSelection.delete(itemId);
    } else {
      newSelection.add(itemId);
    }
    setSelectedItems(newSelection);
  };

  const selectAllVisible = () => {
    const allVisibleIds = new Set(filteredAndSortedItems.map(item => item.id));
    setSelectedItems(allVisibleIds);
  };

  const deselectAll = () => {
    setSelectedItems(new Set());
  };

  const exportToCSV = () => {
    const selectedItemsData = items.filter(item => selectedItems.has(item.id));
    
    const csvHeaders = ['Name', 'Category', 'Quantity', 'Custom Attributes'];
    const csvRows = selectedItemsData.map(item => [
      item.name,
      item.category,
      item.quantity.toString(),
      JSON.stringify(item.custom_attributes || {})
    ]);
    
    const csvContent = [csvHeaders, ...csvRows]
      .map(row => row.map(field => `"${field.replace(/"/g, '""')}"`).join(','))
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
        Array.from(selectedItems).map(itemId =>
          axios.delete(getApiUrl(`/items/${itemId}`))
        )
      );
      
      // Refresh items list
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
      const selectedItemsData = items.filter(item => selectedItems.has(item.id));
      
      await Promise.all(
        selectedItemsData.map(item =>
          axios.put(getApiUrl(`/items/${item.id}`), {
            ...item,
            category: bulkCategory
          })
        )
      );
      
      // Refresh items list
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
      const selectedItemsData = items.filter(item => selectedItems.has(item.id));
      
      await Promise.all(
        selectedItemsData.map(item => {
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
          
          return axios.put(getApiUrl(`/items/${item.id}`), {
            ...item,
            quantity: newQuantity
          });
        })
      );
      
      // Refresh items list
      await fetchItems();
      setSelectedItems(new Set());
      setBulkQuantityChange('');
    } catch (error) {
      console.error('Bulk quantity update failed:', error);
    } finally {
      setIsProcessingBulk(false);
    }
  };

  return (
    <div className="container mx-auto p-3 sm:p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Your Stuf</h1>
          <p className="text-sm text-muted-foreground">
            {filteredAndSortedItems.length} of {items.length} item{items.length !== 1 ? 's' : ''} 
            {hasActiveFilters && ' (filtered)'}
            {selectedItems.size > 0 && ` • ${selectedItems.size} selected`}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={clearFilters}
              className="h-8 px-3 text-xs"
            >
              <X className="h-3 w-3 mr-1" />
              Clear Filters
            </Button>
          )}
          
          <Button 
            variant={bulkMode ? "default" : "outline"} 
            size="sm" 
            onClick={toggleBulkMode}
            className="h-8 px-3 text-xs"
          >
            {bulkMode ? <CheckSquare className="h-3 w-3 mr-1" /> : <Square className="h-3 w-3 mr-1" />}
            {bulkMode ? 'Exit Select' : 'Select Items'}
          </Button>
        </div>
      </div>

      {/* Bulk Actions Toolbar */}
      {bulkMode && selectedItems.size > 0 && (
        <div className="bg-muted/50 rounded-lg p-4 mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{selectedItems.size} items selected</span>
              <Button variant="outline" size="sm" onClick={selectAllVisible}>
                Select All Visible ({filteredAndSortedItems.length})
              </Button>
              <Button variant="outline" size="sm" onClick={deselectAll}>
                Deselect All
              </Button>
            </div>
            
            <Button variant="outline" size="sm" onClick={exportToCSV}>
              <Download className="h-3 w-3 mr-1" />
              Export CSV
            </Button>
          </div>
          
          {/* Bulk Action Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Bulk Category Change */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Change Category</label>
              <div className="flex gap-2">
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
            
            {/* Bulk Quantity Change */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Adjust Quantity</label>
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
            
            {/* Bulk Delete */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Delete Items</label>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    disabled={isProcessingBulk}
                    className="h-8 w-full"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete Selected
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Selected Items</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete {selectedItems.size} selected item{selectedItems.size !== 1 ? 's' : ''}? 
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={bulkDelete}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {isProcessingBulk ? 'Deleting...' : 'Delete'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filter Bar */}
      <div className="space-y-3 mb-6">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search items, categories, or attributes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          {/* Category Filter */}
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-40 h-9">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
          {categories.map((category) => (
                <SelectItem key={category} value={category}>
              {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Quantity Range */}
          <div className="flex gap-2 sm:gap-1">
            <Input
              placeholder="Min qty"
              type="number"
              value={minQuantity}
              onChange={(e) => setMinQuantity(e.target.value)}
              className="w-20 h-9 text-xs"
              min="0"
            />
            <span className="flex items-center text-muted-foreground text-xs">to</span>
            <Input
              placeholder="Max qty"
              type="number"
              value={maxQuantity}
              onChange={(e) => setMaxQuantity(e.target.value)}
              className="w-20 h-9 text-xs"
              min="0"
            />
          </div>

          {/* Sort Options */}
          <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
            <SelectTrigger className="w-full sm:w-36 h-9">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name-asc">
                <div className="flex items-center gap-2">
                  <SortAsc className="h-3 w-3" />
                  Name A-Z
                </div>
              </SelectItem>
              <SelectItem value="name-desc">
                <div className="flex items-center gap-2">
                  <SortDesc className="h-3 w-3" />
                  Name Z-A
                </div>
              </SelectItem>
              <SelectItem value="quantity-asc">
                <div className="flex items-center gap-2">
                  <SortAsc className="h-3 w-3" />
                  Qty Low-High
                </div>
              </SelectItem>
              <SelectItem value="quantity-desc">
                <div className="flex items-center gap-2">
                  <SortDesc className="h-3 w-3" />
                  Qty High-Low
                </div>
              </SelectItem>
              <SelectItem value="category-asc">
                <div className="flex items-center gap-2">
                  <SortAsc className="h-3 w-3" />
                  Category A-Z
                </div>
              </SelectItem>
              <SelectItem value="category-desc">
                <div className="flex items-center gap-2">
                  <SortDesc className="h-3 w-3" />
                  Category Z-A
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
        {filteredAndSortedItems.map((item) => (
          <div key={item.id} className="relative">
            {/* Selection Checkbox (when in bulk mode) */}
            {bulkMode && (
              <button
                onClick={(e) => toggleItemSelection(item.id, e)}
                className="absolute top-2 left-2 z-20 p-1 rounded bg-background/80 hover:bg-background border"
              >
                {selectedItems.has(item.id) ? (
                  <CheckSquare className="h-4 w-4 text-primary" />
                ) : (
                  <Square className="h-4 w-4" />
                )}
              </button>
            )}
            
            {/* Item Card */}
            <Link 
              to={`/item/${item.id}`}
              className={`block hover:scale-[1.02] transition-transform ${
                bulkMode ? 'pointer-events-none' : ''
              }`}
              onClick={(e) => {
                if (bulkMode) {
                  e.preventDefault();
                  toggleItemSelection(item.id, e);
                }
              }}
            >
              <Card className={`hover:shadow-lg transition-shadow overflow-hidden h-full ${
                selectedItems.has(item.id) ? 'ring-2 ring-primary' : ''
              }`}>
                <CardContent className="p-0">
                  {/* Compact image thumbnail */}
                  <div className="relative aspect-square">
                    {item.image_url ? (
                      <img 
                        src={getAssetUrl(item.image_url)} 
                        alt={item.name} 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <span className="text-muted-foreground text-xs">No Image</span>
                      </div>
                    )}
                    {/* Quantity badge overlay */}
                    <Badge 
                      variant="secondary" 
                      className="absolute top-1 right-1 text-xs px-1.5 py-0.5 h-auto"
                    >
                      {item.quantity}
                    </Badge>
                  </div>
                  
                  {/* Compact info section */}
                  <div className="p-2 sm:p-3 space-y-1">
                    <CardTitle className="text-xs sm:text-sm font-medium leading-tight line-clamp-2">
                      {item.name}
                    </CardTitle>
                    <Badge variant="outline" className="text-xs px-1.5 py-0.5 h-auto w-fit">
                      {item.category}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredAndSortedItems.length === 0 && (
        <div className="text-center py-8 sm:py-12">
          <p className="text-muted-foreground mb-4">
            {items.length === 0 
              ? 'No items found.' 
              : hasActiveFilters 
                ? 'No items match your search criteria.'
                : 'No items found.'
            }
          </p>
          {items.length === 0 ? (
            <Button asChild className="h-10 sm:h-9">
              <Link to="/add">Add your first item</Link>
            </Button>
          ) : hasActiveFilters ? (
            <Button variant="outline" onClick={clearFilters} className="h-10 sm:h-9">
              Clear Filters
            </Button>
          ) : (
            <Button asChild className="h-10 sm:h-9">
              <Link to="/add">Add Item</Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default ItemList;
