import React from 'react';
import { AlertTriangle, Edit2, Trash2, Save, X } from 'lucide-react';
import { Button } from '@/ui/button';
import { Card } from '@/ui/card';
import { Badge } from '@/ui/badge';
import { Input } from '@/ui/input';
import { Alert, AlertDescription } from '@/ui/alert';
import { Group, GroupMember } from '@/types';
import { useState } from 'react';
import { businessLogic } from '@/store/useBusinessLogic';
import { useFavoritesStore } from '@/store/useFavoritesStore';
import { useGroupsStore } from '@/store/useGroupsStore';

interface AllMembersTabProps {
  allMembers: { member: GroupMember; groups: Group[] }[];
  onOpenChangeGroups: (member: GroupMember) => void;
}

export const AllMembersTab: React.FC<AllMembersTabProps> = ({
  allMembers,
  onOpenChangeGroups
}) => {
  const [editingMember, setEditingMember] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [nameError, setNameError] = useState('');
  const { removeGroupMember, addGroupMember } = businessLogic;
  const { favorites, removeFromFavorites, addToFavorites } = useFavoritesStore();
  const { groups } = useGroupsStore();

  const handleEditStart = (member: GroupMember) => {
    setEditingMember(member.name);
    setEditName(member.name);
    setNameError('');
  };

  const handleEditCancel = () => {
    setEditingMember(null);
    setEditName('');
    setNameError('');
  };

  const validateUniqueName = (newName: string, currentName: string) => {
    if (newName.trim() === currentName) return true;
    
    const existingMember = allMembers.find(({ member }) => 
      member.name.toLowerCase() === newName.trim().toLowerCase()
    );
    
    if (existingMember) {
      setNameError('A member with this name already exists. Usernames must be unique.');
      return false;
    }
    
    setNameError('');
    return true;
  };

  const handleEditSave = (originalMember: GroupMember, memberGroups: Group[]) => {
    const newName = editName.trim();
    if (!newName) {
      setNameError('Name cannot be empty.');
      return;
    }

    if (!validateUniqueName(newName, originalMember.name)) {
      return;
    }

    // Update member in all groups they belong to
    memberGroups.forEach(group => {
      removeGroupMember(group.id, originalMember.name);
      addGroupMember(group.id, newName, originalMember.allergens);
    });

    // Update favorites assigned to this member
    const memberFavorites = favorites.filter(fav => fav.assignedTo === originalMember.name);
    memberFavorites.forEach(favorite => {
      removeFromFavorites(favorite.id);
      addToFavorites({
        ...favorite,
        assignedTo: newName
      });
    });

    setEditingMember(null);
    setEditName('');
    setNameError('');
  };

  const handleDeleteMember = (member: GroupMember, memberGroups: Group[]) => {
    // Remove member from all groups
    memberGroups.forEach(group => {
      removeGroupMember(group.id, member.name);
    });

    // Handle favorites assigned to this member
    const memberFavorites = favorites.filter(fav => fav.assignedTo === member.name);
    memberFavorites.forEach(favorite => {
      // Move favorite to all groups the member was in
      memberGroups.forEach(group => {
        addToFavorites({
          ...favorite,
          id: `${favorite.id}-${group.id}`,
          groupId: group.id,
          assignedTo: undefined // Unassign the favorite
        });
      });
      // Remove original favorite
      removeFromFavorites(favorite.id);
    });
  };

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
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      {editingMember === member.name ? (
                        <div className="flex items-center gap-2 flex-1">
                          <Input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="font-medium text-lg"
                            placeholder="Member name"
                          />
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              onClick={() => handleEditSave(member, memberGroups)}
                              className="h-8 w-8 p-0"
                            >
                              <Save className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleEditCancel}
                              className="h-8 w-8 p-0"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <span className="font-medium text-lg">{member.name}</span>
                          {member.allergens && member.allergens.length > 0 && (
                            <AlertTriangle className="h-4 w-4 text-destructive" />
                          )}
                        </>
                      )}
                    </div>
                    
                    {nameError && (
                      <Alert variant="destructive" className="mt-2">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>{nameError}</AlertDescription>
                      </Alert>
                    )}
                    
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
                  
                  {editingMember !== member.name && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditStart(member)}
                      >
                        <Edit2 className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onOpenChangeGroups(member)}
                      >
                        <Edit2 className="h-3 w-3 mr-1" />
                        Change Groups
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteMember(member, memberGroups)}
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};