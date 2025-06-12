import React from 'react';
import { User, AlertTriangle } from 'lucide-react';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/select';
import { Label } from '@/ui/label';
import { Badge } from '@/ui/badge';
import { GroupMember } from '@/types';

interface GroupMemberAssignmentProps {
  groupMembers: GroupMember[];
  selectedPerson: string;
  onPersonChange: (person: string) => void;
  itemAllergens?: string[];
  className?: string;
}

export const GroupMemberAssignment: React.FC<GroupMemberAssignmentProps> = ({
  groupMembers,
  selectedPerson,
  onPersonChange,
  itemAllergens = [],
  className = ''
}) => {
  // Function to check if a member has allergen conflicts with the item
  const hasAllergenConflict = (member: GroupMember): boolean => {
    if (!member.allergens || member.allergens.length === 0 || itemAllergens.length === 0) {
      return false;
    }
    return member.allergens.some(allergen => 
      itemAllergens.some(itemAllergen => 
        itemAllergen.toLowerCase().includes(allergen.toLowerCase()) ||
        allergen.toLowerCase().includes(itemAllergen.toLowerCase())
      )
    );
  };

  // Sort members to show those with conflicts at the bottom
  const sortedMembers = [...groupMembers].sort((a, b) => {
    const aHasConflict = hasAllergenConflict(a);
    const bHasConflict = hasAllergenConflict(b);
    
    if (aHasConflict && !bHasConflict) return 1;
    if (!aHasConflict && bHasConflict) return -1;
    return a.name.localeCompare(b.name);
  });

  if (groupMembers.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      <div className="pb-3">
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <User className="h-5 w-5" />
          Assign to Group Member
        </h2>
      </div>
      <div>
        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="person-select">Who is this for? (Optional)</Label>
            <Select value={selectedPerson || "unassigned"} onValueChange={(value) => onPersonChange(value === "unassigned" ? "" : value)}>
              <SelectTrigger id="person-select" className="bg-white">
                <SelectValue placeholder="Select a person or leave unassigned" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {sortedMembers.map((member) => {
                  const hasConflict = hasAllergenConflict(member);
                  
                  return (
                    <SelectItem 
                      key={member.name} 
                      value={member.name}
                      className={hasConflict ? 'bg-destructive/5' : ''}
                    >
                      <div className="flex items-center gap-2 w-full">
                        <span className={hasConflict ? 'text-destructive' : ''}>
                          {member.name}
                        </span>
                        {hasConflict && (
                          <AlertTriangle className="h-3 w-3 text-destructive flex-shrink-0" />
                        )}
                      </div>
                      {member.allergens && member.allergens.length > 0 && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Allergic to: {member.allergens.join(', ')}
                        </div>
                      )}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Show warning if selected person has allergen conflicts */}
          {selectedPerson && selectedPerson !== "unassigned" && (() => {
            const selectedMember = groupMembers.find(m => m.name === selectedPerson);
            const hasConflict = selectedMember && hasAllergenConflict(selectedMember);
            
            if (hasConflict && selectedMember) {
              const conflictingAllergens = selectedMember.allergens.filter(allergen =>
                itemAllergens.some(itemAllergen =>
                  itemAllergen.toLowerCase().includes(allergen.toLowerCase()) ||
                  allergen.toLowerCase().includes(itemAllergen.toLowerCase())
                )
              );

              return (
                <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-destructive">
                      Allergen Warning for {selectedPerson}
                    </p>
                    <p className="text-xs text-destructive/80">
                      This item may contain: {conflictingAllergens.join(', ')}
                    </p>
                  </div>
                </div>
              );
            }
            return null;
          })()}

          {/* Summary info */}
          <div className="text-xs text-muted-foreground">
            {selectedPerson && selectedPerson !== "unassigned" ? (
              <div className="flex items-center gap-1">
                <span>Assigned to:</span>
                <Badge variant="secondary" className="text-xs">
                  {selectedPerson}
                </Badge>
              </div>
            ) : (
              <span>This item will be unassigned in your group order</span>
            )}
          </div>
        </div>
        <div className="border-t mt-4 pt-4"></div>
      </div>
    </div>
  );
};