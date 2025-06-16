import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/ui/button';
import { Input } from '@/ui/input';
import { Label } from '@/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/ui/dialog';
import { Group, GroupMember } from '@/types';
import { MemberSearchBar } from '../shared/MemberSearchBar';
import { UserPlus } from 'lucide-react';

interface GroupSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: Group | null;
  onRenameGroup: (groupId: string, newName: string) => void;
  onAddMember: (member: GroupMember) => void;
  existingMembers: GroupMember[];
}

export const GroupSettingsModal: React.FC<GroupSettingsModalProps> = ({
  isOpen,
  onClose,
  group,
  onRenameGroup,
  onAddMember,
  existingMembers
}) => {
  const [groupName, setGroupName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredMembers, setFilteredMembers] = useState<GroupMember[]>([]);

  useEffect(() => {
    if (group) {
      setGroupName(group.name);
    }
  }, [group]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredMembers([]);
      return;
    }
    
    // Filter existing members that match the search query and are not already in the group
    const groupMemberNames = group?.members.map(m => m.name.toLowerCase()) || [];
    const filtered = existingMembers.filter(member => 
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
      !groupMemberNames.includes(member.name.toLowerCase())
    );
    
    setFilteredMembers(filtered);
  }, [searchQuery, existingMembers, group]);

  const handleSave = useCallback(() => {
    if (group && groupName.trim() && groupName !== group.name) {
      onRenameGroup(group.id, groupName.trim());
    }
    onClose();
  }, [group, groupName, onRenameGroup, onClose]);

  const handleAddMember = useCallback((member: GroupMember) => {
    if (group) {
      onAddMember(member);
      setSearchQuery('');
    }
  }, [group, onAddMember]);

  const handleClose = useCallback(() => {
    setGroupName('');
    setSearchQuery('');
    onClose();
  }, [onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Group Settings</DialogTitle>
          <DialogDescription>
            Modify group name and add members
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="groupName">Group Name</Label>
            <Input
              id="groupName"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Enter group name"
              disabled={group?.name === 'Just You'}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Add Members</Label>
            <MemberSearchBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              placeholder="Search members to add..."
            />
            
            {filteredMembers.length > 0 && (
              <div className="mt-2 border rounded-md divide-y max-h-48 overflow-y-auto">
                {filteredMembers.map((member) => (
                  <div 
                    key={member.name}
                    className="flex items-center justify-between p-2 hover:bg-muted"
                  >
                    <div>
                      <p className="font-medium">{member.name}</p>
                      {member.allergens && member.allergens.length > 0 && (
                        <p className="text-xs text-destructive">
                          Allergies: {member.allergens.join(', ')}
                        </p>
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
                ))}
              </div>
            )}
            
            {searchQuery.trim() && filteredMembers.length === 0 && (
              <p className="text-sm text-muted-foreground py-2">
                No matching members found
              </p>
            )}
          </div>
          
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};