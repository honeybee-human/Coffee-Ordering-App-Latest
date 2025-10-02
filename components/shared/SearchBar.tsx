import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/select';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  searchMode: 'name' | 'description';
  onSearchModeChange: (value: 'name' | 'description') => void;
  placeholder?: string;
  className?: string;
  afterSelectAddon?: React.ReactNode;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  onSearchChange,
  searchMode,
  onSearchModeChange,
  placeholder,
  className = '',
  afterSelectAddon
}) => {
  return (
    <div className={`flex flex-col lg:flex-row lg:items-center gap-3 flex-1 max-w-2xl ${className}`}>
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder={placeholder || `Search by ${searchMode}...`}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 bg-white"
        />
      </div>
      <div className="flex items-stretch lg:items-center gap-3">
        <div className='border border-b-2 border-r-2'>
          <Select value={searchMode} onValueChange={(value: 'name' | 'description') => onSearchModeChange(value)}>
            <SelectTrigger className="w-full border border-b-2 border-r-2 hover:shadow-[2px_2px_0_0_#964B00] sm:w-48 bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Item Name</SelectItem>
              <SelectItem value="description">Item Description</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {afterSelectAddon}
      </div>
    </div>
  );
};