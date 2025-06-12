import React, { useState } from 'react';
import { Heart, Users, User } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/ui/dialog';
import { Button } from '@/ui/button';
import { Label } from '@/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/select';
import { RadioGroup, RadioGroupItem } from '@/ui/radio-group';
import { Group, GroupMember, FavoriteItem } from '@/types';

interface FavoriteAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (assignedToGroup?: string, assignedToMember?: string) => void;
  groups: Group[];
  favoriteItem?: FavoriteItem;
}

export const FavoriteAssignmentModal: React.FC<FavoriteAssignmentModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  groups,
  favoriteItem
}) => {
  const [assignmentType, setAssignmentType] = useState<'none' | 'group' | 'member'>('none');
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [selectedMemberName, setSelectedMemberName] = useState<string>('');

  const selectedGroup = groups.find(g => g.id === selectedGroupId);

  const handleConfirm = () => {
    let assignedToGroup: string | undefined;
    let assignedToMember: string | undefined;

    if (assignmentType === 'group') {
      assignedToGroup = selectedGroupId;
    } else if (assignmentType === 'member') {
      assignedToGroup = selectedGroupId;
      assignedToMember = selectedMemberName;
    }

    onConfirm(assignedToGroup, assignedToMember);
    handleClose();
  };

  const handleClose = () => {
    setAssignmentType('none');
    setSelectedGroupId('');
    setSelectedMemberName('');
    onClose();
  };

  const isValid = () => {
    if (assignmentType === 'none') return true;
    if (assignmentType === 'group') return selectedGroupId !== '';
    if (assignmentType === 'member') return selectedGroupId !== '' && selectedMemberName !== '';
    return false;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            Assign Favorite
          </DialogTitle>
          <DialogDescription>
            {favoriteItem ? 
              `Choose how to assign "${favoriteItem.item.name}" to your groups or members.` :
              'Choose how to assign this favorite to your groups or members.'
            }
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label>Assignment Type</Label>
            <RadioGroup value={assignmentType} onValueChange={(value: 'none' | 'group' | 'member') => setAssignmentType(value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="none" id="none" />
                <Label htmlFor="none">No specific assignment</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="group" id="group" />
                <Label htmlFor="group" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Assign to entire group
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="member" id="member" />
                <Label htmlFor="member" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Assign to specific member
                </Label>
              </div>
            </RadioGroup>
          </div>

          {(assignmentType === 'group' || assignmentType === 'member') && (
            <div>
              <Label htmlFor="group-select">Select Group</Label>
              <Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a group" />
                </SelectTrigger>
                <SelectContent>
                  {groups.map((group) => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.name} ({group.members.length} members)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {assignmentType === 'member' && selectedGroup && (
            <div>
              <Label htmlFor="member-select">Select Member</Label>
              <Select value={selectedMemberName} onValueChange={setSelectedMemberName}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a member" />
                </SelectTrigger>
                <SelectContent>
                  {selectedGroup.members.map((member) => (
                    <SelectItem key={member.name} value={member.name}>
                      {member.name}
                      {member.allergens.length > 0 && (
                        <span className="text-xs text-gray-500 ml-2">
                          ({member.allergens.join(', ')})
                        </span>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        
        <div className="flex gap-2 pt-4">
          <Button 
            onClick={handleConfirm}
            disabled={!isValid()}
            className="flex-1"
          >
            Confirm Assignment
          </Button>
          <Button 
            variant="outline" 
            onClick={handleClose}
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};