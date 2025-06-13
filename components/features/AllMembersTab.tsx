import React from 'react';
import { AlertTriangle, Edit2 } from 'lucide-react';
import { Button } from '@/ui/button';
import { Card } from '@/ui/card';
import { Badge } from '@/ui/badge';
import { Group, GroupMember } from '@/types';

interface AllMembersTabProps {
  allMembers: { member: GroupMember; groups: Group[] }[];
  onOpenChangeGroups: (member: GroupMember) => void;
}

export const AllMembersTab: React.FC<AllMembersTabProps> = ({
  allMembers,
  onOpenChangeGroups
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">All Members</h3>
        <p className="text-sm text-muted-foreground">
          {allMembers.length} unique member{allMembers.length !== 1 ? 's' : ''} across all groups
        </p>
      </div>
      
      {allMembers.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">
          No members found. Add members to your groups first.
        </p>
      ) : (
        <div className="space-y-3">
          {allMembers.map(({ member, groups: memberGroups }, index) => (
            <Card key={`${member.name}-${index}`} className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-lg">{member.name}</span>
                    {member.allergens && member.allergens.length > 0 && (
                      <AlertTriangle className="h-4 w-4 text-destructive" />
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {memberGroups.length > 0 ? (
                      memberGroups.map((group, groupIndex) => (
                        <Badge key={`${group.id}-${groupIndex}`} variant="secondary" className="text-xs">
                          {group.name}
                        </Badge>
                      ))
                    ) : (
                      <Badge variant="outline" className="text-xs text-muted-foreground">
                        No groups
                      </Badge>
                    )}
                  </div>
                </div>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onOpenChangeGroups(member)}
                >
                  <Edit2 className="h-3 w-3 mr-1" />
                  Change Groups
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};