import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';

interface AllergenWarningProps {
  isOpen: boolean;
  onClose: () => void;
  onProceed: () => void;
  allergens: string[];
  affectedMembers: string[];
  itemName: string;
}

export const AllergenWarning: React.FC<AllergenWarningProps> = ({
  isOpen,
  onClose,
  onProceed,
  allergens,
  affectedMembers,
  itemName
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Allergen Warning
          </DialogTitle>
          <DialogDescription>
            The item "{itemName}" contains allergens that may affect group members.
          </DialogDescription>
        </DialogHeader>
        
        <Alert className="border-destructive/50">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Potential Allergen Conflict</AlertTitle>
          <AlertDescription>
            <div className="mt-2 space-y-2">
              <div>
                <strong>Allergens present:</strong> {allergens.join(', ')}
              </div>
              <div>
                <strong>Affected members:</strong> {affectedMembers.join(', ')}
              </div>
            </div>
          </AlertDescription>
        </Alert>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onProceed}>
            Add Anyway
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};