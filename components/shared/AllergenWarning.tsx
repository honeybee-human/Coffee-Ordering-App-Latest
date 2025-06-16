// AllergenWarning.tsx - Refactored to use stores directly
import React, { useMemo } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/ui/alert';
import { Button } from '@/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/ui/dialog';
import { useModalsStore } from '@/store/useModalsStore';

export const AllergenWarning: React.FC = () => {
  const { 
    modals: { allergenWarning }, 
    closeAllergenWarning, 
    proceedWithAllergen 
  } = useModalsStore();

  // Filter allergens to only show those that match with affected members' allergens
  const relevantAllergens = useMemo(() => {
    if (!allergenWarning.allergens.length || !allergenWarning.affectedMembers.length) {
      return [];
    }
    
    // Create a set of all allergens from affected members
    const memberAllergenSet = new Set<string>();
    allergenWarning.affectedMembers.forEach(member => {
      member.allergens.forEach(allergen => memberAllergenSet.add(allergen));
    });
    
    // Only show allergens that are both in the item and in affected members' allergens
    return allergenWarning.allergens.filter(allergen => memberAllergenSet.has(allergen));
  }, [allergenWarning.allergens, allergenWarning.affectedMembers]);

  return (
    <Dialog open={allergenWarning.isOpen} onOpenChange={closeAllergenWarning}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Allergen Warning
          </DialogTitle>
          <DialogDescription>
            The item "{allergenWarning.itemName}" contains allergens that may affect group members.
          </DialogDescription>
        </DialogHeader>
        
        <Alert className="border-destructive/50">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Potential Allergen Conflict</AlertTitle>
          <AlertDescription>
            <div className="mt-2 space-y-2">
              <div>
                <strong>Conflicting allergens:</strong> {relevantAllergens.join(', ')}
              </div>
              <div>
                <strong>Affected members:</strong> {allergenWarning.affectedMembers.map(member => member.name).join(', ')}
              </div>
            </div>
          </AlertDescription>
        </Alert>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={closeAllergenWarning}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={proceedWithAllergen}>
            Add Anyway
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};