import React from 'react';
import { AlertTriangle, Users } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/ui/dialog';
import { Button } from '@/ui/button';
import { Alert, AlertDescription } from '@/ui/alert';

interface NoMembersWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToGroups: () => void;
}

export const NoMembersWarningModal: React.FC<NoMembersWarningModalProps> = ({
  isOpen,
  onClose,
  onNavigateToGroups
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-amber-600">
            <AlertTriangle className="h-5 w-5" />
            Cannot Place Order
          </DialogTitle>
          <DialogDescription>
            You need to add members to your group before placing an order.
          </DialogDescription>
        </DialogHeader>
        
        <Alert className="border-amber-200 bg-amber-50">
          <Users className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            Orders must be assigned to group members. Please add at least one member to your group to continue.
          </AlertDescription>
        </Alert>
        
        <div className="flex flex-col gap-2 pt-4">
          <Button 
            onClick={onNavigateToGroups}
            className="w-full"
          >
            <Users className="h-4 w-4 mr-2" />
            Go to Groups Page
          </Button>
          <Button 
            variant="outline" 
            onClick={onClose}
            className="w-full"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};