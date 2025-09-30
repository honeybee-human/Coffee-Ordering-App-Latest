import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/ui/input';

interface GroupSearchBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const GroupSearchBar: React.FC<GroupSearchBarProps> = ({
  searchQuery,
  onSearchChange,
  placeholder = 'Search groups...',
  className = ''
}) => {
  return (
    <div className={`relative flex-1 max-w-md ${className}`}>
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="text"
        placeholder={placeholder}
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-10 bg-white w-full"
      />
    </div>
  );
};