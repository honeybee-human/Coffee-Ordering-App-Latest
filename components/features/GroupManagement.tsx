import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/ui/alert-dialog';
import { Plus, Trash2, Edit2, Users, AlertTriangle, UserPlus, Check, RotateCcw, X, Badge, Crown, Settings, ChevronDown, Sparkles, Star, Zap, Shield } from 'lucide-react';
import { Group, GroupMember } from '@/types';
import { ChangeGroupsModal } from '@/components/modals/ChangeGroupsModal';
import { AddMemberModal } from '@/components/modals/AddMemberModal';
import { CreateGroupModal } from '@/components/modals/CreateGroupModal';
import { AllMembersTab } from './AllMembersTab';
import { GroupMembersSection } from './GroupMembersSection';
import { CardHeader, CardTitle, CardContent, Card } from '@/ui/card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/ui/select';
import { useGroupsStore } from '@/store/useGroupsStore';
import { useFavoritesStore } from '@/store/useFavoritesStore';
import { Button } from '@/ui/button';
import { Input } from '@/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/ui/tabs';


// Add to imports
import { GroupSearchBar } from '../shared/GroupSearchBar';
import { GroupSettingsModal } from '../modals/GroupSettingsModal';
import { AddExistingMemberModal } from '@/components/modals/AddExistingMemberModal';




export const GroupManagement: React.FC = () => {
  const {
    groups,
    activeGroupId,
    createGroup,
    selectGroup,
    deleteGroup,
    renameGroup,
    addGroupMember,
    removeGroupMember,
    resetAllData,
    toggleFavoriteGroup
  } = useGroupsStore();

  const { resetFavorites, cleanupMemberFavorites } = useFavoritesStore();

  const handleResetAllData = useCallback(() => {
    resetAllData();
    resetFavorites();
  }, [resetAllData, resetFavorites]);

  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isAddExistingMemberOpen, setIsAddExistingMemberOpen] = useState(false); // Add this state
  const [isChangeGroupsOpen, setIsChangeGroupsOpen] = useState(false);
  const [isGroupSettingsOpen, setIsGroupSettingsOpen] = useState(false); // Add this state
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null); // Add this state
  const [selectedMember, setSelectedMember] = useState<GroupMember | null>(null);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editGroupName, setEditGroupName] = useState('');
  const [editingMember, setEditingMember] = useState<GroupMember | null>(null);
  const activeGroup = useMemo(() => groups.find(group => group.id === activeGroupId), [groups, activeGroupId]);
const [groupSearchQuery, setGroupSearchQuery] = useState('');

const sortedGroups = useMemo(() => {
  const filtered = groups.filter(group => 
    group.name.toLowerCase().includes(groupSearchQuery.toLowerCase())
  );
  
  return [...filtered].sort((a, b) => {

    // Then sort by favorite status
    if (a.isFavorite && !b.isFavorite) return -1;
    if (!a.isFavorite && b.isFavorite) return 1;
    
    // Finally sort by name
    return a.name.localeCompare(b.name);
  });
}, [groups, groupSearchQuery]);// Add to imports
  const handleCreateGroup = useCallback((groupName: string) => {
    createGroup(groupName);
    setIsCreateGroupOpen(false);
  }, [createGroup]);

  const handleRenameGroup = useCallback((groupId: string) => {
    if (editGroupName.trim()) {
      renameGroup(groupId, editGroupName.trim());
      setEditingGroupId(null);
      setEditGroupName('');
    }
  }, [editGroupName, renameGroup]);

  const handleAddMember = useCallback((member: GroupMember) => {
    if (activeGroupId) {
      addGroupMember(activeGroupId, member);
      setIsAddMemberOpen(false);
    }
  }, [activeGroupId, addGroupMember]);

  // Update the handleEditMember function to properly set the state and open the modal
  const handleEditMember = useCallback((member: GroupMember) => {
    setEditingMember(member);
    setIsAddMemberOpen(true);
  }, []);

  const startEditingGroup = useCallback((group: Group) => {
    setSelectedGroup(group);
    setIsGroupSettingsOpen(true);
  }, []);

  const cancelEditing = useCallback(() => {
    setEditingGroupId(null);
    setEditGroupName('');
  }, []);

  // Get all unique members across all groups
  const allMembers = useMemo(() => {
    const memberMap = new Map<string, { member: GroupMember; groups: Group[] }>();
    
    groups.forEach((group: Group) => {
      group.members.forEach((member: GroupMember) => {
        const key = `${member.name}-${JSON.stringify(member.allergens.sort())}`;
        if (memberMap.has(key)) {
          memberMap.get(key)!.groups.push(group);
        } else {
          memberMap.set(key, { member, groups: [group] });
        }
      });
    });
    
    return Array.from(memberMap.values());
  }, [groups]);

  const handleOpenChangeGroups = useCallback((member: GroupMember) => {
    setSelectedMember(member);
    setIsChangeGroupsOpen(true);
  }, []);

  const handleCloseChangeGroups = useCallback(() => {
    setSelectedMember(null);
    setIsChangeGroupsOpen(false);
  }, []);

  const handleToggleMemberGroup = useCallback((member: GroupMember, groupId: string, isAdding: boolean) => {
    if (isAdding) {
      addGroupMember(groupId, member);
    } else {
      removeGroupMember(groupId, member.name);
      cleanupMemberFavorites(member.name, groupId);
    }
  }, [addGroupMember, removeGroupMember, cleanupMemberFavorites]);

  // Add this new callback for handling existing member addition
  const handleAddExistingMember = useCallback((member: GroupMember) => {
    if (activeGroupId) {
      addGroupMember(activeGroupId, member);
      setIsAddExistingMemberOpen(false);
    }
  }, [activeGroupId, addGroupMember]);

  

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <span className="text-lg font-bold">Group Management</span>
            </div>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:text-destructive"
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
                    onClick={handleResetAllData}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Reset All Data
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="groups" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="groups">Active Group</TabsTrigger>
              <TabsTrigger value="all-groups">All Groups</TabsTrigger>
              <TabsTrigger value="members">All Members</TabsTrigger>
            </TabsList>
            
            <TabsContent value="groups" className="space-y-4 mt-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Active Group</h3>
                  <Button
                    onClick={() => setIsCreateGroupOpen(true)}
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Group
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Select
                    value={activeGroup?.id || ''}
                    onValueChange={selectGroup}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select a group" />
                    </SelectTrigger>
                    <SelectContent>
                      {groups.map(group => (
                        <SelectItem 
                          key={group.id} 
                          value={group.id}
                        >
                          {group.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {activeGroup && (
                <GroupMembersSection
                  activeGroup={activeGroup}
                  onAddNewMember={() => setIsAddMemberOpen(true)}
                  onAddExistingMember={() => activeGroup && setIsAddExistingMemberOpen(true)}
                  onRemoveMember={(groupId, memberName) => {
                    removeGroupMember(groupId, memberName);
                    cleanupMemberFavorites(memberName, groupId);
                  }}
                  onEditMember={handleEditMember}
                  onChangeGroups={handleOpenChangeGroups}
                />
              )}
            </TabsContent>
            
            <TabsContent value="all-groups" className="space-y-4 mt-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">All Groups</h3>
                  <Button
                    onClick={() => setIsCreateGroupOpen(true)}
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Group
                  </Button>
                </div>
                              
                <div className="flex items-center justify-between gap-2 mb-3">
                  <GroupSearchBar 
                    searchQuery={groupSearchQuery} 
                    onSearchChange={setGroupSearchQuery} 
                    placeholder="Search groups..."
                  />
                  <p className="text-sm text-muted-foreground whitespace-nowrap">
                    {sortedGroups.length} of {groups.length} groups
                  </p>
                </div>
                <div className="space-y-2">
                  {sortedGroups.map((group: Group) => (
                    <div 
                      key={group.id} 
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        group.id === activeGroupId ? 'bg-primary/10 border-primary/20' : 'bg-card border-border'
                      }`}
                    >
                      <div className="flex items-center gap-2 flex-1">
                        {editingGroupId === group.id ? (
                          <div className="flex items-center gap-2 flex-1">
                            <Input
                              value={editGroupName}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditGroupName(e.target.value)}
                              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                                if (e.key === 'Enter') handleRenameGroup(group.id);
                                if (e.key === 'Escape') cancelEditing();
                              }}
                              className="flex-1"
                            />
                            <Button 
                              size="sm" 
                              onClick={() => handleRenameGroup(group.id)}
                            >
                              <Check className="h-3 w-3" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={cancelEditing}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <>
                          {   group.id === activeGroupId && <Crown className="h-4 w-4 text-amber-500" />
}
                            {group.isFavorite && (
                              <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                            )}
                            <span className={group.id === activeGroupId ? 'text-primary' : ''}>
                              {group.name}
                            </span>
                            <span className="inline-flex items-center rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground">
                              {group.members.length} member{group.members.length !== 1 ? 's' : ''}
                            </span>
                            {group.cart && group.cart.length > 0 && (
                              <span className="inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium">
                                {group.cart.length} item{group.cart.length !== 1 ? 's' : ''} in cart
                              </span>
                            )}
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => toggleFavoriteGroup(group.id)}
                            className={group.isFavorite ? "text-amber-500" : ""}
                          >
                            <Star className={`h-4 w-4 ${group.isFavorite ? "fill-amber-500" : ""}`} />
                          </Button>
                        
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => startEditingGroup(group)}
                          >
                            <Settings className="h-3 w-3" />
                          </Button>
                        
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteGroup(group.id)}
                            disabled={groups.length <= 1}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="members" className="space-y-4 mt-4">
              <AllMembersTab
                allMembers={allMembers}
                onOpenChangeGroups={handleOpenChangeGroups}
                onEditMember={handleEditMember}
                onAddNewMember={() => setIsAddMemberOpen(true)}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Create Group Dialog */}
      <CreateGroupModal
        isOpen={isCreateGroupOpen}
        onClose={() => setIsCreateGroupOpen(false)}
        onCreateGroup={handleCreateGroup}
      />


<AddMemberModal
        isOpen={isAddMemberOpen}
        onClose={() => {
          setIsAddMemberOpen(false);
          setEditingMember(null); // Clear editing member when closing
        }}
        onAddMember={(member) => {
          if (editingMember) {
            // If editing, remove the old member first
            removeGroupMember(activeGroup!.id, editingMember.name);
          }
          handleAddMember(member);
          setEditingMember(null); // Clear editing member after saving
        }}
        existingMembers={allMembers.map(({ member }) => member)}
        editingMember={editingMember}
        isEditing={!!editingMember}
      />


      {/* Add the missing AddExistingMemberModal */}
      <AddExistingMemberModal
        isOpen={isAddExistingMemberOpen}
        onClose={() => setIsAddExistingMemberOpen(false)}
        onAddMember={handleAddExistingMember}
        existingMembers={allMembers.map(({ member }) => member)}
        currentGroup={activeGroup!}
      />

      {/* Change Groups Modal */}
      <ChangeGroupsModal
        isOpen={isChangeGroupsOpen}
        onClose={handleCloseChangeGroups}
        selectedMember={selectedMember}
        groups={groups}
        onToggleMemberGroup={(groupId: string, isMember: boolean) => {
          if (selectedMember) {
            handleToggleMemberGroup(selectedMember, groupId, isMember);
          }
        }}
      />

<GroupSettingsModal
        isOpen={isGroupSettingsOpen}
        onClose={() => {
          setIsGroupSettingsOpen(false);
          setSelectedGroup(null);
        }}
        group={selectedGroup}
        onRenameGroup={handleRenameGroup}
        onAddMember={handleAddMember}
        existingMembers={allMembers.map(({ member }) => member)}
      removeGroupMember={removeGroupMember}
      />


    </div>
  );
};

