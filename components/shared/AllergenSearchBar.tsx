import React from 'react';
import { Search, Plus } from 'lucide-react';
import { Input } from '@/ui/input';
import { Button } from '@/ui/button';

interface AllergenSearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  showSearchSuggestions: boolean;
  setShowSearchSuggestions: (show: boolean) => void;
  searchSuggestions: string[];
  onAddAllergen: (allergen: string) => void;
}

export const AllergenSearchBar: React.FC<AllergenSearchBarProps> = ({
  searchQuery,
  setSearchQuery,
  showSearchSuggestions,
  setShowSearchSuggestions,
  searchSuggestions,
  onAddAllergen
}) => {
  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Add custom allergen..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setShowSearchSuggestions(true)}
          className="pl-10"
        />
      </div>
      
      {showSearchSuggestions && searchSuggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-md shadow-lg z-50 max-h-48 overflow-y-auto">
          {searchSuggestions.map(allergen => (
            <button
              key={allergen}
              onClick={() => onAddAllergen(allergen)}
              className="w-full text-left px-3 py-2 hover:bg-muted flex items-center gap-2 text-sm"
            >
              <Plus className="h-3 w-3" />
              {allergen}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};