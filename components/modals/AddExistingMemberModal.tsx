import React, { useState, useMemo } from 'react';
import { UserPlus } from 'lucide-react';
import { Button } from '@/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/ui/dialog';
import { GroupMember, Group } from '@/types';
import { MemberSearchBar } from '../shared/MemberSearchBar';
import { Badge } from '@/ui/badge';
import { useAllMembers } from '@/store/useGroupsStore';

interface AddExistingMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMember: (member: GroupMember) => void;
  currentGroup: Group | null | undefined;
}

export const AddExistingMemberModal: React.FC<AddExistingMemberModalProps> = ({
  isOpen,
  onClose,
  onAddMember,
  currentGroup
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Get all members from the store directly
  const allMembers = useAllMembers();

  // Filter out members who are already in the current group
  const availableMembers = useMemo(() => {
    if (!currentGroup || !currentGroup.members) {
      return allMembers;
    }
    
    const currentGroupMemberNames = currentGroup.members.map(m => m.name.toLowerCase());
    return allMembers.filter((member: { name: string; }) => 
      !currentGroupMemberNames.includes(member.name.toLowerCase())
    );
  }, [allMembers, currentGroup]);

  const filteredMembers = useMemo(() => {
    if (!searchQuery.trim()) return availableMembers;
    
    return availableMembers.filter((member: { name: string; }) => 
      member.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [availableMembers, searchQuery]);

  const handleAddMember = (member: GroupMember) => {
    onAddMember(member);
    setSearchQuery('');
    onClose();
  };

  const handleClose = () => {
    setSearchQuery('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Existing Member</DialogTitle>
          <DialogDescription>
            Choose from existing members to add to this group
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <MemberSearchBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            placeholder="Search existing members..."
          />
          
          <div className="text-sm text-muted-foreground">
            {availableMembers.length} members available • {allMembers.length} total members
          </div>
          
          <div className="max-h-60 overflow-y-auto space-y-2">
            {filteredMembers.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                {availableMembers.length === 0 
                  ? "All existing members are already in this group"
                  : searchQuery.trim() 
                    ? `No members found matching "${searchQuery}"`
                    : "No existing members available"
                }
              </p>
            ) : (
              filteredMembers.map((member: GroupMember, index: any) => (
                <div key={`${member.name}-${index}`} className="flex items-center justify-between p-3 border border-border bg-white rounded-lg">
                  <div className="flex-1 ">
                    <p className="font-medium">{member.name}</p>
                    {member.allergens && member.allergens.length > 0 ? (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {member.allergens.map((allergen: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined, idx: React.Key | null | undefined) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {allergen}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">No allergies</p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleAddMember(member)}
                  >
                    <UserPlus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>
              ))
            )}
          </div>
          
          <div className="flex justify-end">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};