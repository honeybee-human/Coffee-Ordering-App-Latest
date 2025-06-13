import React from 'react';
import { AlertTriangle, UserPlus, Trash2 } from 'lucide-react';
import { Button } from '@/ui/button';
import { Separator } from '@/ui/separator';
import { Group } from '@/types';

interface GroupMembersSectionProps {
  activeGroup: Group;
  onAddMember: () => void;
  onRemoveMember: (groupId: string, memberName: string) => void;
}

export const GroupMembersSection: React.FC<GroupMembersSectionProps> = ({
  activeGroup,
  onAddMember,
  onRemoveMember
}) => {
  return (
    <>
      <Separator />
      {/* Popup alert for allergic members */}
      {activeGroup.members.some(m => m.allergens && m.allergens.length > 0) && (
        <div className="bg-destructive/10 border border-destructive text-destructive rounded-md p-3 flex items-center gap-2 mb-3">
          <AlertTriangle className="h-5 w-5" />
          <span>
            Warning: Some members in this group have allergies! Please review their allergens before placing an order.
          </span>
        </div>
      )}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold">Members in "{activeGroup.name}"</span>
          <Button 
            size="sm" 
            onClick={onAddMember}
            disabled={activeGroup.name === 'Just You'}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Add Member
          </Button>
        </div>

        {activeGroup.members.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No members in this group yet. Add some members to start ordering!
          </p>
        ) : (
          <div className="space-y-3">
            {activeGroup.members.map((member, index) => (
              <div key={`${member.name}-${index}`} className="flex items-center justify-between p-3">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{member.name}</span>
                    {member.allergens && member.allergens.length > 0 && (
                      <AlertTriangle className="h-4 w-4 text-destructive" />
                    )}
                  </div>
                  
                  {member.allergens && member.allergens.length > 0 ? (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Allergies:</p>
                      <div className="flex flex-wrap gap-2">
                        {member.allergens.map((allergen, allergenIndex) => (
                          <span key={`${allergen}-${allergenIndex}`} className="flex items-center gap-1 text-sm text-destructive">
                            <AlertTriangle className="h-3 w-3" />
                            {allergen}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">No known allergies</p>
                  )}
                </div>
                
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onRemoveMember(activeGroup.id, member.name)}
                  disabled={activeGroup.name === 'Just You'}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};