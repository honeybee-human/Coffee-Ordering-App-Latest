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
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  onSearchChange,
  searchMode,
  onSearchModeChange,
  placeholder,
  className = ''
}) => {
  return (
    <div className={`flex flex-col sm:flex-row gap-3 flex-1 max-w-2xl ${className}`}>
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder={placeholder || `Search by ${searchMode}...`}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 bg-muted"
        />
      </div>
      <Select value={searchMode} onValueChange={(value: 'name' | 'description') => onSearchModeChange(value)}>
        <SelectTrigger className="w-full sm:w-48 bg-muted">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="name">Search by Name</SelectItem>
          <SelectItem value="description">Search by Description</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};