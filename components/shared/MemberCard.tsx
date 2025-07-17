import React from 'react';
import { AlertTriangle, Edit2, Trash2, UserMinus, Users } from 'lucide-react';
import { Button } from '@/ui/button';
import { Badge } from '@/ui/badge';
import { Group, GroupMember } from '@/types';
import { Separator } from '@radix-ui/react-select';

interface MemberCardProps {
  member: GroupMember;
  groups?: Group[];
  showGroups?: boolean;
  onEditMember: (member: GroupMember) => void;
  onRemoveMember?: (groupId: string, memberName: string) => void;
  onChangeGroups?: (member: GroupMember) => void;
  onDeleteMember?: (member: GroupMember, memberGroups: Group[]) => void;
  groupId?: string;
  isDisabled?: boolean;
}

export const MemberCard: React.FC<MemberCardProps> = ({
  member,
  groups = [],
  showGroups = false,
  onEditMember,
  onRemoveMember,
  onChangeGroups,
  onDeleteMember,
  groupId,
  isDisabled = false,
}) => {
  return (
    <div className="flex items-center justify-between p-3">
      <div className="space-y-2 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium">{member.name}</span>
          {member.allergens && member.allergens.length > 0 && (
            <AlertTriangle className="h-4 w-4 text-destructive" />
          )}
        </div>
        
        {member.allergens && member.allergens.length > 0 ? (
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Allergies:</p>
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
          <p className="text-sm text-muted-foreground">No known allergies</p>
        )}

        {showGroups && groups && groups.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {groups.length > 0 ? (
              groups.map((group, groupIndex) => (
                <Badge key={`${group.id}-${groupIndex}`} variant="secondary" className="text-sm">
                  {group.name}
                </Badge>
              ))
            ) : (
              <Badge variant="outline" className="text-sm text-muted-foreground">
                No groups
              </Badge>
            )}
          </div>
        )}
      </div>
      
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onEditMember(member)}
        >
          <Edit2 className="h-3 w-3 mr-1" />
          Edit
        </Button>
        
        {onChangeGroups && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onChangeGroups(member)}
            disabled={isDisabled}
          >
            <Users className="h-3 w-3 mr-1" />
            Change Groups
          </Button>
        )}
        
        {onDeleteMember && groups && (
          <Button
            size="sm"
        variant="ghost"
            className='text-destructive'
            onClick={() => onDeleteMember(member, groups)}
            disabled={isDisabled || member.name== 'You'}
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Delete
          </Button>
        )}
        
        
        {onRemoveMember && groupId && (
          <Button
            size="sm"
            variant="ghost"
            className='text-destructive'
            onClick={() => onRemoveMember(groupId, member.name)}
            disabled={isDisabled}
          >
            <UserMinus className="h-3 w-3" />
            Remove
          </Button>
        )}
      </div>
    </div>
  );
};