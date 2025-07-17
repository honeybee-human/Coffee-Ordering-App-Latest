import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/ui/alert-dialog';
import { Plus, Trash2, Edit2, Users, AlertTriangle, UserPlus, Check, RotateCcw, X, Badge, Crown, Settings, ChevronDown, Sparkles, Star, Zap, Shield, Filter } from 'lucide-react';
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
import { useOrdersStore } from '@/store/useOrdersStore';
import { useAllergensStore, useAutoFilterEnabled } from '@/store/useAllergensStore';
import { Button } from '@/ui/button';
import { Input } from '@/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/ui/tabs';
import { Toggle } from '@/ui/toggle'; // Import Toggle component
import { Label } from '@/ui/label';

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
  const { clearOrderHistory } = useOrdersStore();
  
  // Allergen store hooks
  const { toggleAutoFilter, updateFiltersFromGroupMembers, clearAllergenFilters } = useAllergensStore();
  const autoFilterEnabled = useAutoFilterEnabled();

  const handleResetAllData = useCallback(() => {
    resetAllData();
    resetFavorites();
    clearAllergenFilters();
    clearOrderHistory(); // Clear order history when resetting all data
  }, [resetAllData, resetFavorites, clearAllergenFilters, clearOrderHistory]);

  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isAddExistingMemberOpen, setIsAddExistingMemberOpen] = useState(false);
  const [isChangeGroupsOpen, setIsChangeGroupsOpen] = useState(false);
  const [isGroupSettingsOpen, setIsGroupSettingsOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [selectedMember, setSelectedMember] = useState<GroupMember | null>(null);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editGroupName, setEditGroupName] = useState('');
  const [editingMember, setEditingMember] = useState<GroupMember | null>(null);
  const activeGroup = useMemo(() => groups.find(group => group.id === activeGroupId), [groups, activeGroupId]);
  const [groupSearchQuery, setGroupSearchQuery] = useState('');

  // Update filters when active group changes and auto-filter is enabled
  useEffect(() => {
    if (autoFilterEnabled && activeGroupId) {
      updateFiltersFromGroupMembers();
    }
  }, [activeGroupId, autoFilterEnabled, updateFiltersFromGroupMembers]);

  const sortedGroups = useMemo(() => {
    const filtered = groups.filter(group => 
      group.name.toLowerCase().includes(groupSearchQuery.toLowerCase())
    );
    
    return [...filtered].sort((a, b) => {
      // Sort by favorite status
      if (a.isFavorite && !b.isFavorite) return -1;
      if (!a.isFavorite && b.isFavorite) return 1;
      
      // Finally sort by name
      return a.name.localeCompare(b.name);
    });
  }, [groups, groupSearchQuery]);

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
      
      // Update filters if auto-filter is enabled
      if (autoFilterEnabled) {
        setTimeout(() => updateFiltersFromGroupMembers(), 0);
      }
    }
  }, [activeGroupId, addGroupMember, autoFilterEnabled, updateFiltersFromGroupMembers]);

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
    
    // Update filters if auto-filter is enabled and this affects the active group
    if (autoFilterEnabled && groupId === activeGroupId) {
      setTimeout(() => updateFiltersFromGroupMembers(), 0);
    }
  }, [addGroupMember, removeGroupMember, cleanupMemberFavorites, autoFilterEnabled, activeGroupId, updateFiltersFromGroupMembers]);

  const handleAddExistingMember = useCallback((member: GroupMember) => {
    if (activeGroupId) {
      addGroupMember(activeGroupId, member);
      setIsAddExistingMemberOpen(false);
      
      // Update filters if auto-filter is enabled
      if (autoFilterEnabled) {
        setTimeout(() => updateFiltersFromGroupMembers(), 0);
      }
    }
  }, [activeGroupId, addGroupMember, autoFilterEnabled, updateFiltersFromGroupMembers]);

  const handleAutoFilterToggle = useCallback(() => {
    toggleAutoFilter();
  }, [toggleAutoFilter]);

  return (
    <div className="space-y-6 container mx-auto px-4 py-8">
      <div className='bg-transparent border-none'>
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h1>Group Management</h1>
            </div>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:text-destructive md:px-4 md:py-2 h-10 w-10 md:w-auto p-0 md:p-2"
                >
                  <RotateCcw className="h-5 w-5 md:mr-2" />
                  <span className="hidden md:inline">Reset All Data</span>
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
          </div>
        </div>
        <div className='mt-10'>
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
                    className="md:px-4 md:py-2 h-10 w-10 md:w-auto p-0 md:p-2"
                  >
                    <Plus className="h-5 w-5 md:mr-2" />
                    <span className="hidden md:inline">New Group</span>
                  </Button>
                </div>
                
                {/* Mobile: Active group selector on its own line */}
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="w-full md:flex-1">
                    <Select
                      value={activeGroup?.id || ''}
                      onValueChange={selectGroup}
                    >
                      <SelectTrigger className="bg-muted">
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
                  
                  {/* Mobile: Auto filter and enable button on line below */}
                  <div className="flex items-center justify-between md:justify-start gap-3 p-3 rounded-lg bg-muted/50 w-full md:flex-1">
                    <div className="flex items-center gap-3 flex-1">
                      <Filter className="h-4 w-4 text-muted-foreground" />
                      <div className='flex-1'>
                        <Label className="text-sm font-medium">Auto-Filter Allergens</Label>
                        <p className="text-sm text-muted-foreground hidden md:block">
                          Automatically filter menu items based on active group member allergens
                        </p>
                      </div>
                    </div>
                    <Toggle
                      pressed={autoFilterEnabled}
                      onPressedChange={handleAutoFilterToggle}
                      variant="default"
                      className="border data-[state=on]:bg-transparent data-[state=off]:bg-transparent data-[state=on]:text-green-600 data-[state=off]:text-red-600 hover:bg-muted/50 hover:scale-105 transition-all duration-200 shrink-0"
                    >
                      <Shield className="h-4 w-4" />
                      <span className="hidden md:inline ml-1">{autoFilterEnabled ? 'Enabled' : 'Disabled'}</span>
                    </Toggle>
                  </div>
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
                    
                    if (autoFilterEnabled && groupId === activeGroupId) {
                      setTimeout(() => updateFiltersFromGroupMembers(), 0);
                    }
                  }}
                  onEditMember={handleEditMember}
                  onChangeGroups={handleOpenChangeGroups}
                />
              )}
            </TabsContent>
            
            <TabsContent value="all-groups" className="space-y-4 mt-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">All Groups</h3>
                  <Button
                    onClick={() => setIsCreateGroupOpen(true)}
                    size="sm"
                    className="md:px-4 md:py-2 h-10 w-10 md:w-auto p-0 md:p-2"
                  >
                    <Plus className="h-5 w-5 md:mr-2" />
                    <span className="hidden md:inline">New Group</span>
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
                              className="md:px-3 md:py-2 h-8 w-8 md:w-auto p-0 md:p-2"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={cancelEditing}
                              className="md:px-3 md:py-2 h-8 w-8 md:w-auto p-0 md:p-2"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <>
                            {group.id === activeGroupId && <Crown className="h-4 w-4 text-amber-500" />}
                            {group.isFavorite && (
                              <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                            )}
                            <span className={group.id === activeGroupId ? 'text-primary' : ''}>
                              {group.name}
                            </span>
                            <span className="inline-flex items-center rounded-md bg-secondary px-2 py-1 text-sm font-medium text-secondary-foreground">
                              {group.members.length} member{group.members.length !== 1 ? 's' : ''}
                            </span>
                            {group.cart && group.cart.length > 0 && (
                              <span className="inline-flex items-center rounded-md border px-2 py-1 text-sm font-medium">
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
                          className={`${group.isFavorite ? "text-amber-500" : ""} md:px-3 md:py-2 h-8 w-8 md:w-auto p-0 md:p-2`}
                        >
                          <Star className={`h-5 w-5 ${group.isFavorite ? "fill-amber-500" : ""}`} />
                        </Button>
                      
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => startEditingGroup(group)}
                          className="md:px-3 md:py-2 h-8 w-8 md:w-auto p-0 md:p-2"
                        >
                          <Settings className="h-5 w-5" />
                        </Button>
                      
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteGroup(group.id)}
                          disabled={groups.length <= 1}
                          className="md:px-3 md:py-2 h-8 w-8 md:w-auto p-0 md:p-2"
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="members" className="space-y-4 mt-4">
              <AllMembersTab
                onOpenChangeGroups={handleOpenChangeGroups}
                onEditMember={handleEditMember}
                onAddNewMember={() => setIsAddMemberOpen(true)}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>

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
          setEditingMember(null);
        }}
        onAddMember={(member) => {
          if (editingMember) {
            removeGroupMember(activeGroup!.id, editingMember.name);
          }
          handleAddMember(member);
          setEditingMember(null);
        }}
        existingMembers={allMembers.map(({ member }) => member)}
        editingMember={editingMember}
        isEditing={!!editingMember}
      />

      <AddExistingMemberModal
        isOpen={isAddExistingMemberOpen}
        onClose={() => setIsAddExistingMemberOpen(false)}
        onAddMember={handleAddExistingMember}
        currentGroup={activeGroup!}
      />

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