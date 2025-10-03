import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/ui/input';

interface MemberSearchBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const MemberSearchBar: React.FC<MemberSearchBarProps> = ({
  searchQuery,
  onSearchChange,
  placeholder = 'Search members...',
  className = ''
}) => {
  return (
    <div className={`relative flex-1 w-full ${className}`}>
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="text"
        placeholder={placeholder}
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-10 bg-white w-full h-10"
      />
    </div>
  );
};