import React from 'react';
import { AlertTriangle, UserCheck, UserX, UserPlus } from 'lucide-react';
import { Button } from '@/ui/button';
import { Badge } from '@/ui/badge';
import { Label } from '@/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/ui/dialog';
import { Group, GroupMember } from '@/types';
import { useFavoritesStore } from '@/store/useFavoritesStore';

interface ChangeGroupsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMember: GroupMember | null;
  groups: Group[];
  onToggleMemberGroup: (groupId: string, isMember: boolean) => void;
}

export const ChangeGroupsModal: React.FC<ChangeGroupsModalProps> = ({
  isOpen,
  onClose,
  selectedMember,
  groups,
  onToggleMemberGroup
}) => {
  // Move the hook call to the top level of the component
  const { transferMemberFavorites, cleanupMemberFavorites } = useFavoritesStore();
  
  const handleToggleMemberGroup = (groupId: string, isMember: boolean) => {
    if (!selectedMember) return;
    
    if (isMember) {
      // Member is currently IN this group, so REMOVE them
      cleanupMemberFavorites(selectedMember.name, groupId);
      onToggleMemberGroup(groupId, false); // false = removing
    } else {
      // Member is NOT in this group, so ADD them
      // Simply add to the new group without removing from others
      onToggleMemberGroup(groupId, true); // true = adding
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Group Membership</DialogTitle>
          <DialogDescription>
            {selectedMember ? `Manage group membership for ${selectedMember.name}` : ''}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {selectedMember && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="font-medium">{selectedMember.name}</span>
                {selectedMember.allergens && selectedMember.allergens.length > 0 && (
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                )}
              </div>
              
              <div className="space-y-2">
                <Label>Group Membership</Label>
                <div className="space-y-2">
                  {groups.map(group => {
                    const isMember = group.members.some(m => 
                      m.name === selectedMember.name && 
                      JSON.stringify(m.allergens.sort()) === JSON.stringify(selectedMember.allergens.sort())
                    );
                    
                    return (
                      <div key={group.id} className="flex items-center justify-between p-3 rounded border">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{group.name}</span>
                          {isMember ? (
                            <Badge variant="default" className="text-xs">
                              <UserCheck className="h-3 w-3 mr-1" />
                              Member
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs">
                              <UserX className="h-3 w-3 mr-1" />
                              Not Member
                            </Badge>
                          )}
                        </div>
                        
                        <Button
                          size="sm"
                          variant={isMember ? "destructive" : "default"}
                          onClick={() => handleToggleMemberGroup(group.id, isMember)}
                        >
                          {isMember ? (
                            <>
                              <UserX className="h-3 w-3 mr-1" />
                              Remove
                            </>
                          ) : (
                            <>
                              <UserPlus className="h-3 w-3 mr-1" />
                              Add
                            </>
                          )}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
          
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={onClose}
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
