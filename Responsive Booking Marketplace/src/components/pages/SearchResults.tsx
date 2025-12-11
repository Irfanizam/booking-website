import { useState, useMemo } from 'react';
import { FilterPanel } from '../search/FilterPanel';
import { BusinessCard } from '../search/BusinessCard';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import { SlidersHorizontal, Map, LayoutGrid } from 'lucide-react';

interface SearchResultsProps {
  businesses: any[];
  onBusinessClick: (businessId: string) => void;
  categories?: string[];
  onFilterChange?: (filters: any) => void;
}

export function SearchResults({ businesses, onBusinessClick, categories, onFilterChange }: SearchResultsProps) {
  const [sortBy, setSortBy] = useState('relevance');
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');

  // LOGIC: Sort the businesses based on selection
  const sortedBusinesses = useMemo(() => {
    return [...businesses].sort((a, b) => {
      if (sortBy === 'price-low') return a.minPrice - b.minPrice;
      if (sortBy === 'price-high') return b.minPrice - a.minPrice;
      if (sortBy === 'rating') return b.rating - a.rating; // Assuming rating exists
      return 0; // Relevance (default order)
    });
  }, [businesses, sortBy]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h3 className="mb-2">{businesses.length} businesses found</h3>
          <p className="text-gray-500">
            Showing results based on your filters
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            {/* Mobile Filter Button */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="lg:hidden">
                  <SlidersHorizontal className="w-4 h-4 mr-2" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] p-0">
                <FilterPanel 
                    isMobile 
                    categories={categories}
                    onApplyFilters={onFilterChange}
                />
              </SheetContent>
            </Sheet>

            {/* Sort Dropdown */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px] bg-white">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Relevance</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* View Toggle */}
          <div className="hidden md:flex items-center gap-2 bg-white rounded-lg p-1 border">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'map' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('map')}
            >
              <Map className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex gap-8">
          {/* Desktop Filter Panel */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <FilterPanel 
                categories={categories} 
                onApplyFilters={onFilterChange}
            />
          </div>

          {/* Results */}
          <div className="flex-1">
            {viewMode === 'grid' ? (
              <div className="space-y-6">
                {/* RENDER THE SORTED LIST */}
                {sortedBusinesses.map((business) => (
                  <BusinessCard
                    key={business.id}
                    business={business}
                    onClick={() => onBusinessClick(business.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-8 shadow-sm h-[600px] flex items-center justify-center">
                <div className="text-center">
                  <Map className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h5 className="mb-2">Map View</h5>
                  <p className="text-gray-500">
                    Interactive map view coming soon
                  </p>
                </div>
              </div>
            )}

            {/* Empty State */}
            {businesses.length === 0 && (
              <div className="bg-white rounded-2xl p-12 shadow-sm text-center">
                <div className="max-w-md mx-auto">
                  <h4 className="mb-2">No results found</h4>
                  <p className="text-gray-500 mb-6">
                    Try adjusting your filters to see more results.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}