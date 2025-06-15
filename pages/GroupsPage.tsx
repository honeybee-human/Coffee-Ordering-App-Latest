// Add to imports
import { useState, useMemo } from 'react';
import { GroupSearchBar } from '../components/shared/GroupSearchBar';

// Add state for search query
const [groupSearchQuery, setGroupSearchQuery] = useState('');

// Modify sortedGroups to filter by search query
const sortedGroups = useMemo(() => {
  const filtered = groups.filter(group => 
    group.name.toLowerCase().includes(groupSearchQuery.toLowerCase())
  );
  
  return [...filtered].sort((a, b) => {
    // Always put "Just You" first
    if (a.name === 'Just You') return -1;
    if (b.name === 'Just You') return 1;
    
    // Then sort by favorite status
    if (a.isFavorite && !b.isFavorite) return -1;
    if (!a.isFavorite && b.isFavorite) return 1;
    
    // Finally sort by name
    return a.name.localeCompare(b.name);
  });
}, [groups, groupSearchQuery]);

// Add the search bar to the JSX after the header and before the group list
{groups.length > 0 && (
  <div className="flex items-center justify-between gap-2 mb-4">
    <GroupSearchBar 
      searchQuery={groupSearchQuery} 
      onSearchChange={setGroupSearchQuery} 
      placeholder="Search groups..."
    />
    <p className="text-sm text-muted-foreground whitespace-nowrap">
      {sortedGroups.length} of {groups.length} groups
    </p>
  </div>
)}