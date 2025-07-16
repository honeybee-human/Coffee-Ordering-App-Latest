import React from 'react';
import { User, AlertTriangle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/select';
import { Label } from '@/ui/label';
import { Badge } from '@/ui/badge';
import { GroupMember, CoffeeCustomization } from '@/types';
import { useGroupMemberAssignmentStore } from '@/store/useGroupMemberAssignmentStore';
import { useGroupsStore } from '@/store/useGroupsStore';

interface GroupMemberAssignmentProps {
  itemAllergens?: string[];
  customizations?: CoffeeCustomization;
  className?: string;
}

export const GroupMemberAssignment: React.FC<GroupMemberAssignmentProps> = ({
  itemAllergens = [],
  customizations,
  className = ''
}) => {
  const activeGroup = useGroupsStore(state => state.getActiveGroup());
  const { 
    selectedPerson, 
    setSelectedPerson, 
    hasAllergenConflict, 
    getSortedMembers,
    getConflictingAllergens 
  } = useGroupMemberAssignmentStore();

  if (!activeGroup || activeGroup.members.length === 0) {
    return null;
  }

  // Helper function to get allergens for milk type
  const getMilkAllergens = (milk: string): string[] => {
    const allergens: string[] = [];
    if (milk.includes('Milk') && milk !== 'No Milk') allergens.push('Milk');
    if (milk.includes('Soy')) allergens.push('Soy');
    if (milk.includes('Almond')) allergens.push('Almonds');
    return allergens;
  };

  // Helper function to get allergens for syrup
  const getSyrupAllergens = (flavor: string): string[] => {
    const allergens: string[] = [];
    if (flavor.toLowerCase().includes('hazelnut')) {
      allergens.push('Hazelnuts', 'Nuts');
    }
    return allergens;
  };

  // Calculate comprehensive allergens including customizations
  const getComprehensiveAllergens = (): string[] => {
    const allAllergens = new Set([...itemAllergens]);
    
    if (customizations) {
      // Add milk allergens
      if (customizations.milk && customizations.milk !== 'No Milk') {
        const milkAllergens = getMilkAllergens(customizations.milk);
        milkAllergens.forEach(allergen => allAllergens.add(allergen));
      }
      
      // Add syrup allergens
      customizations.syrups?.forEach(syrup => {
        const syrupAllergens = getSyrupAllergens(syrup.flavor);
        syrupAllergens.forEach(allergen => allAllergens.add(allergen));
      });
    }
    
    return Array.from(allAllergens);
  };

  const comprehensiveAllergens = getComprehensiveAllergens();
  const sortedMembers = getSortedMembers(activeGroup.members, comprehensiveAllergens);

  // Block assignment if selected person has conflicts
  const handlePersonChange = (value: string) => {
    if (value === "unassigned") {
      setSelectedPerson("");
      return;
    }
    
    const selectedMember = activeGroup.members.find(m => m.name === value);
    if (selectedMember && hasAllergenConflict(selectedMember, comprehensiveAllergens)) {
      // Block the assignment - don't change the selection
      return;
    }
    
    setSelectedPerson(value);
  };

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
            <Select 
              value={selectedPerson || "unassigned"} 
              onValueChange={handlePersonChange}
            >
              <SelectTrigger id="person-select" className="bg-muted p-4">
                <SelectValue placeholder="Select a person or leave unassigned" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {sortedMembers.map((member) => {
                  const hasConflict = hasAllergenConflict(member, comprehensiveAllergens);
                  
                  return (
                    <SelectItem 
                      key={member.name} 
                      value={member.name}
                      className={hasConflict ? 'bg-destructive/5' : ''}
                      disabled={hasConflict}
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
                        <div className="text-sm text-muted-foreground mt-1">
                          Allergic to: {member.allergens.join(', ')}
                        </div>
                      )}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

 

          {/* Show blocking message for members with conflicts */}
          {(() => {
            const membersWithConflicts = activeGroup.members.filter(member => 
              hasAllergenConflict(member, comprehensiveAllergens)
            );
            
            if (membersWithConflicts.length > 0) {
              return (
                <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-yellow-800">
                      Assignment Blocked
                    </p>
                    <p className="text-sm text-yellow-700">
                      Cannot assign to {membersWithConflicts.map(m => m.name).join(', ')} due to allergen conflicts with selected milk or syrups.
                    </p>
                  </div>
                </div>
              );
            }
            return null;
          })()}
       
        </div>
        <div className="mt-4"></div>
      </div>
    </div>
  );
};

