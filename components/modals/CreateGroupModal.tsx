import React, { useState, useCallback } from 'react';
import { Button } from '@/ui/button';
import { Input } from '@/ui/input';
import { Label } from '@/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/ui/dialog';

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateGroup: (groupName: string) => void;
}

export const CreateGroupModal: React.FC<CreateGroupModalProps> = ({
  isOpen,
  onClose,
  onCreateGroup
}) => {
  const [groupName, setGroupName] = useState('');

  const handleCreateGroup = useCallback(() => {
    if (groupName.trim()) {
      onCreateGroup(groupName.trim());
      setGroupName('');
      onClose();
    }
  }, [groupName, onCreateGroup, onClose]);

  const handleClose = useCallback(() => {
    setGroupName('');
    onClose();
  }, [onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Group</DialogTitle>
          <DialogDescription>
            Enter a name for your new group
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
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateGroup}>
              Create Group
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};