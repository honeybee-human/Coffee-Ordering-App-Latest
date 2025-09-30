import React from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/ui/alert-dialog';
import { Button } from '@/ui/button';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface ResetDataModalProps {
  onResetData: () => void;
}

export const ResetDataModal: React.FC<ResetDataModalProps> = ({ onResetData }) => {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="text-destructive"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset All Data
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Reset All Group Data
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to reset all group data? This will delete all groups and their members, and cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onResetData}
            className="bg-destructive text-destructive-foreground"
          >
            Reset All Data
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};