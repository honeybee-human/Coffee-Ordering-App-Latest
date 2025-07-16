import React, { useState, useMemo } from 'react';
import { AlertTriangle, UserPlus, Users } from 'lucide-react';
import { Button } from '@/ui/button';
import { Separator } from '@/ui/separator';
import { Group, GroupMember } from '@/types';
import { MemberCard } from '../shared/MemberCard';
import { MemberSearchBar } from '../shared/MemberSearchBar';

interface GroupMembersSectionProps {
  activeGroup: Group;
  onAddNewMember: () => void;
  onAddExistingMember: () => void;
  onRemoveMember: (groupId: string, memberName: string) => void;
  onEditMember: (member: GroupMember) => void;
  onChangeGroups: (member: GroupMember) => void;
}

export const GroupMembersSection: React.FC<GroupMembersSectionProps> = ({
  activeGroup,
  onAddNewMember,
  onAddExistingMember,
  onRemoveMember,
  onEditMember,
  onChangeGroups
}) => {
  const [searchQuery, setSearchQuery] = useState('');
 const hasAllergies = useMemo(() => {
    return activeGroup.members.some(m => m.allergens && m.allergens.length > 0);
  }, [activeGroup.members]);
  const filteredMembers = useMemo(() => {
    if (!searchQuery.trim()) return activeGroup.members;
    
    return activeGroup.members.filter(member => 
      member.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [activeGroup.members, searchQuery]);

  return (
    <>
      <Separator />
  {hasAllergies ? (
        <div className="bg-destructive/10 border border-destructive text-destructive rounded-md p-3 flex items-center gap-2 mb-3">
          <AlertTriangle className="h-5 w-5" />
          <span>
            Warning: Some members in this group have allergies! Please review their allergens before placing an order.
          </span>
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-md p-3 flex items-center gap-2 mb-3">
          <AlertTriangle className="h-5 w-5" />
          <span>
            Currently no allergies recorded for members in this group. Double check if this is correct!
          </span>
        </div>
      )}


      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold">Members in {activeGroup.name}</span>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              onClick={onAddNewMember}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              New Member
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={onAddExistingMember}
            >
              <Users className="h-4 w-4 mr-2" />
              Add Member
            </Button>
          </div>
        </div>
        
        {activeGroup.members.length > 0 && (
          <div className="flex items-center justify-between gap-2">
            <MemberSearchBar 
              searchQuery={searchQuery} 
              onSearchChange={setSearchQuery} 
              placeholder="Search members in this group..."
            />
            <p className="text-sm text-muted-foreground whitespace-nowrap">
              {filteredMembers.length} of {activeGroup.members.length} members
            </p>
          </div>
        )}

        {activeGroup.members.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No members in this group yet. Add some members to start ordering!
          </p>
        ) : filteredMembers.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">
            No members found matching "{searchQuery}"
          </p>
        ) : (
          <div className="space-y-3">
            {filteredMembers.map((member, index) => (
              <MemberCard
                key={`${member.name}-${index}`}
                member={member}
                onEditMember={onEditMember}
                onRemoveMember={onRemoveMember}
                onChangeGroups={onChangeGroups}
                groupId={activeGroup.id}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
};