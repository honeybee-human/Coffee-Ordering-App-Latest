import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from './ui/button';
import { GroupMember } from '../types';
import { User } from 'lucide-react';

interface AssignOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemId: string;
  groupMembers: GroupMember[];
  onAssign: (itemId: string, memberName: string) => void;
}

export const AssignOrderModal: React.FC<AssignOrderModalProps> = ({
  isOpen,
  onClose,
  itemId,
  groupMembers,
  onAssign,
}) => {
  const handleAssign = (memberName: string) => {
    onAssign(itemId, memberName);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign to Group Member</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Choose which group member this item is for:
          </p>
          <div className="grid gap-2">
            {groupMembers.length > 0 ? (
              groupMembers.map((member) => (
                <Button
                  key={member.name}
                  variant="outline"
                  className="justify-start"
                  onClick={() => handleAssign(member.name)}
                >
                  <User className="h-4 w-4 mr-2" />
                  {member.name}
                </Button>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                No group members available. Please add members to your group first.
              </p>
            )}
          </div>
          <div className="flex justify-end">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};