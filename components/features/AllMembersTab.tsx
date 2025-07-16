import React, { useState, useMemo } from 'react';
import { Card } from '@/ui/card';
import { Button } from '@/ui/button';
import { UserPlus } from 'lucide-react';
import { GroupMember, Group } from '@/types';
import { useGroupsStore } from '@/store/useGroupsStore';
import { useFavoritesStore } from '@/store/useFavoritesStore';
import { FavoritesController } from '@/controllers/FavoritesController';
import { MemberCard } from '../shared/MemberCard';
import { MemberSearchBar } from '../shared/MemberSearchBar';

interface AllMembersTabProps {
  onOpenChangeGroups: (member: GroupMember) => void;
  onEditMember: (member: GroupMember) => void;
  onAddNewMember: () => void;
}

export const AllMembersTab: React.FC<AllMembersTabProps> = ({
  onOpenChangeGroups,
  onEditMember,
  onAddNewMember
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { groups, allMembers, removeGroupMember, removeMember } = useGroupsStore();
  const { favorites, removeFromFavorites, addToFavorites } = useFavoritesStore();

  // Get the groups each member belongs to
  const membersWithGroups = useMemo(() => {
    return allMembers.map(member => {
      const memberGroups = groups.filter(group => 
        group.members.some(m => 
          m.name === member.name && 
          JSON.stringify(m.allergens.sort()) === JSON.stringify(member.allergens.sort())
        )
      );
      return { member, groups: memberGroups };
    });
  }, [allMembers, groups]);

  const filteredMembers = useMemo(() => {
    if (!searchQuery.trim()) return membersWithGroups;
    
    return membersWithGroups.filter(({ member }) => 
      member.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [membersWithGroups, searchQuery]);

  const handleDeleteMember = (member: GroupMember, memberGroups: Group[]) => {
    // Remove member from all groups using store action
    memberGroups.forEach(group => {
      removeGroupMember(group.id, member.name);
    });

    // Remove from allMembers
    removeMember(member.name);

    // Handle favorites cleanup using controller
    const memberFavorites = FavoritesController.getMemberFavorites(favorites, member.name);
    
    memberFavorites.forEach(favorite => {
      // Move personal favorites to group-level for each group the member was in
      memberGroups.forEach(group => {
        addToFavorites({
          ...favorite,
          id: `${favorite.id}-${group.id}`,
          groupId: group.id,
          assignedTo: undefined // Convert to group-level favorite
        });
      });
      // Remove original personal favorite
      removeFromFavorites(favorite.id);
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">All Members</h3>
        <div className="flex items-center gap-4">
          <Button size="sm" onClick={onAddNewMember}>
            <UserPlus className="h-4 w-4 mr-2" />
            New Member
          </Button>
        </div>
      </div>
      
      {allMembers.length > 0 && (
        <div className="flex items-center justify-between gap-2">
          <MemberSearchBar 
            searchQuery={searchQuery} 
            onSearchChange={setSearchQuery} 
            placeholder="Search all members..."
          />
          <p className="text-sm text-muted-foreground whitespace-nowrap">
            {filteredMembers.length} of {allMembers.length} members
          </p>
        </div>
      )}
      
      {allMembers.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">
          No members found. Add members to your groups first.
        </p>
      ) : filteredMembers.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">
          No members found matching "{searchQuery}"
        </p>
      ) : (
        <div className="space-y-3">
          {filteredMembers.map(({ member, groups: memberGroups }, index) => (
            <MemberCard
              key={`${member.name}-${index}`} 
              member={member}
              groups={memberGroups}
              showGroups={true}
              onEditMember={onEditMember}
              onChangeGroups={onOpenChangeGroups}
              onDeleteMember={handleDeleteMember}
            />
          ))}
        </div>
      )}
    </div>
  );
};
