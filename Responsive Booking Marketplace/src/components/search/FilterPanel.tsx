import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import { Button } from '../ui/button';
import { Input } from '../ui/input'; 
import { Search } from 'lucide-react'; 
import { useState } from 'react';
import { toast } from 'sonner';

interface FilterPanelProps {
  onClose?: () => void;
  isMobile?: boolean;
  categories?: string[];
  onApplyFilters?: (filters: any) => void;
}

export function FilterPanel({ onClose, isMobile, categories = [], onApplyFilters }: FilterPanelProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedPriceTiers, setSelectedPriceTiers] = useState<number[]>([]);
  const [noDeposit, setNoDeposit] = useState(false);
  const [openNow, setOpenNow] = useState(false);
  const [searchQuery, setSearchQuery] = useState(''); 

  const handleCategoryChange = (category: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories([...selectedCategories, category]);
    } else {
      setSelectedCategories(selectedCategories.filter(c => c !== category));
    }
  };

  const togglePriceTier = (tier: number) => {
    if (selectedPriceTiers.includes(tier)) {
      setSelectedPriceTiers(selectedPriceTiers.filter(t => t !== tier));
    } else {
      setSelectedPriceTiers([...selectedPriceTiers, tier]);
    }
  };

  const applyFilters = () => {
    if (onApplyFilters) {
      onApplyFilters({
        query: searchQuery, 
        categories: selectedCategories,
        priceTiers: selectedPriceTiers,
        noDeposit: noDeposit,
        openNow: openNow 
      });
      toast.success("Filters applied successfully!");
    }
    if (isMobile && onClose) onClose();
  };

  return (
    <div className="bg-white rounded-3xl p-7 shadow-soft border border-[var(--color-border)] h-fit sticky top-24 z-20 relative">
      
      {/* Keyword Search */}
      <div className="mb-6">
        <h6 className="mb-4 font-semibold">Search</h6>
        <div className="relative">
          {/* UPDATED: Changed left-3 to left-4 for better spacing */}
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input 
            placeholder="Name, service, or location..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 bg-gray-50 border-gray-200 focus:bg-white transition-all"
          />
        </div>
      </div>

      <Separator className="my-6" />

      {/* Category Filter */}
      <div className="mb-6">
        <h6 className="mb-4 font-semibold">Category</h6>
        <div className="space-y-3">
          {categories.map((category) => (
            <div key={category} className="flex items-center space-x-2">
              <Checkbox 
                id={category} 
                checked={selectedCategories.includes(category)}
                onCheckedChange={(checked) => handleCategoryChange(category, checked as boolean)}
              />
              <Label htmlFor={category} className="cursor-pointer capitalize text-sm">
                {category}
              </Label>
            </div>
          ))}
          {categories.length === 0 && <p className="text-sm text-gray-500">No categories found</p>}
        </div>
      </div>

      <Separator className="my-6" />

      {/* Price Tier Filter */}
      <div className="mb-6">
        <h6 className="mb-4 font-semibold">Price Range</h6>
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((tier) => (
            <button
              key={tier}
              onClick={() => togglePriceTier(tier)}
              className={`
                flex-1 h-10 rounded-lg text-sm font-medium transition-all duration-200 border
                ${selectedPriceTiers.includes(tier)
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white border-transparent shadow-md transform scale-105'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400 hover:text-blue-600'
                }
              `}
            >
              {Array(tier).fill('$').join('')}
            </button>
          ))}
        </div>
      </div>

      <Separator className="my-6" />

      {/* Features Filter */}
      <div className="mb-6">
        <h6 className="mb-4 font-semibold">Features</h6>
        <div className="space-y-3">
            <div className="flex items-center space-x-2">
            <Checkbox 
                id="open-now" 
                checked={openNow}
                onCheckedChange={(checked) => setOpenNow(checked as boolean)}
            />
            <Label htmlFor="open-now" className="cursor-pointer text-sm">Open Now</Label>
            </div>

            <div className="flex items-center space-x-2">
            <Checkbox 
                id="no-deposit" 
                checked={noDeposit}
                onCheckedChange={(checked) => setNoDeposit(checked as boolean)}
            />
            <Label htmlFor="no-deposit" className="cursor-pointer text-sm">No Deposit Required</Label>
            </div>
        </div>
      </div>

      <Button 
        onClick={applyFilters} 
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl h-12 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all duration-200 font-medium"
      >
        Apply Filters
      </Button>
    </div>
  );
}