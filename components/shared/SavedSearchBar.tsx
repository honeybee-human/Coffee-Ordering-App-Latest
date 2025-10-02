import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/select';

type SearchMode = 'item' | 'person' | 'group' | 'month';

interface SavedSearchBarProps {
  query: string;
  onQueryChange: (value: string) => void;
  mode: SearchMode;
  onModeChange: (value: SearchMode) => void;
  modes?: SearchMode[]; // Optional list of modes to show; defaults to ['item','person']
  placeholder?: string;
  className?: string;
  afterSelectAddon?: React.ReactNode;
}

export const SavedSearchBar: React.FC<SavedSearchBarProps> = ({
  query,
  onQueryChange,
  mode,
  onModeChange,
  modes = ['item', 'person'],
  placeholder,
  className = '',
  afterSelectAddon
}) => {
  const placeholderText = placeholder || (
    mode === 'person' ? 'Search by assigned person...' :
    mode === 'group' ? 'Search by group name...' :
    mode === 'month' ? 'Search by month name...' :
    'Search by item name...'
  );

  return (
    <div className={`flex flex-col sm:flex-row gap-3 flex-1 max-w-2xl ${className}`}>
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder={placeholderText}
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          className="pl-10 bg-white"
        />
      </div>
      <div className="flex items-stretch gap-3">
        <div className='border border-b-2 border-r-2'>
          <Select value={mode} onValueChange={(value: SearchMode) => onModeChange(value)}>
            <SelectTrigger className="w-full border border-b-2 border-r-2 hover:shadow-[2px_2px_0_0_#964B00] sm:w-48 bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {modes.includes('item') && (<SelectItem value="item">Item Name</SelectItem>)}
              {modes.includes('person') && (<SelectItem value="person">Assigned Person</SelectItem>)}
              {modes.includes('group') && (<SelectItem value="group">Group Name</SelectItem>)}
              {modes.includes('month') && (<SelectItem value="month">Month Name</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        {afterSelectAddon}
      </div>
    </div>
  );
};