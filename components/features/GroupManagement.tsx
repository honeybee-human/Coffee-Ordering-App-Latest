import React, { useState, useCallback, useMemo } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/ui/alert-dialog';
import { Plus, Trash2, Edit2, Users, AlertTriangle, UserPlus, Check, RotateCcw, X, Badge, Crown, Settings, ChevronDown, Sparkles, Star, Zap, Shield } from 'lucide-react';
import { Group, GroupMember } from '@/types';
import { ChangeGroupsModal } from '@/components/modals/ChangeGroupsModal';
import { AddMemberModal } from '@/components/modals/AddMemberModal';
import { CreateGroupModal } from '@/components/modals/CreateGroupModal';
import { AllMembersTab } from './AllMembersTab';
import { GroupMembersSection } from './GroupMembersSection';
import { CardHeader, CardTitle, CardContent, Card } from '@/ui/card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@radix-ui/react-select';
import { useGroupsStore } from '@/store/useGroupsStore';
import { useFavoritesStore } from '@/store/useFavoritesStore';
import { Button } from '@/ui/button';
import { Input } from '@/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/ui/tabs';

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
    resetAllData
  } = useGroupsStore();

  const { resetFavorites } = useFavoritesStore();

  const handleResetAllData = useCallback(() => {
    resetAllData();
    resetFavorites();
  }, [resetAllData, resetFavorites]);

  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isChangeGroupsOpen, setIsChangeGroupsOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<GroupMember | null>(null);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editGroupName, setEditGroupName] = useState('');

  const activeGroup = groups.find((g: Group) => g.id === activeGroupId);

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

  const startEditingGroup = useCallback((group: Group) => {
    setEditingGroupId(group.id);
    setEditGroupName(group.name);
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

  const handleToggleMemberGroup = useCallback((groupId: string, isMember: boolean) => {
    if (!selectedMember) return;
    
    if (isMember) {
      removeGroupMember(groupId, selectedMember.name);
    } else {
      addGroupMember(groupId, selectedMember);
    }
  }, [selectedMember, removeGroupMember, addGroupMember]);

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
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="groups">Groups</TabsTrigger>
              <TabsTrigger value="members">All Members</TabsTrigger>
            </TabsList>
            
            <TabsContent value="groups" className="space-y-4 mt-4">
              {/* Enhanced Group Selection */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Crown className="h-6 w-6 text-amber-500 animate-pulse" />
                    <div className="absolute -top-1 -right-1 h-3 w-3 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full animate-ping" />
                  </div>
                  <h3 className="text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                    Active Group Command Center
                  </h3>
                  <Sparkles className="h-5 w-5 text-purple-500 animate-bounce" />
                </div>
                </div>
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary via-purple-500 to-pink-500 rounded-xl blur opacity-25 group-hover:opacity-40 transition duration-300 animate-pulse" />
                  <div className="relative bg-white dark:bg-gray-900 rounded-xl border border-primary/20 shadow-lg">
                    <div className="flex gap-3 p-1">
                      <Select 
                        value={activeGroupId || ''} 
                        onValueChange={selectGroup}
                      >
                        <SelectTrigger className="flex-1 bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-gray-800 dark:via-gray-900 dark:to-blue-950 border-2 border-transparent bg-clip-padding hover:border-primary/30 transition-all duration-300 shadow-inner hover:shadow-lg rounded-lg min-h-[3.5rem]">
                          <div className="flex items-center gap-3 px-2">
                            <div className="relative">
                              <Shield className="h-5 w-5 text-primary" />
                              <div className="absolute -top-1 -right-1 h-2 w-2 bg-green-400 rounded-full animate-pulse" />
                            </div>
                            <div className="flex flex-col items-start">
                              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Current Group</span>
                              <SelectValue 
                                placeholder={
                                  <div className="flex items-center gap-2 text-muted-foreground">
                                    <Zap className="h-4 w-4" />
                                    <span>🎯 Choose your squad or create new one</span>
                                  </div>
                                } 
                              />
                            </div>
                            <ChevronDown className="h-4 w-4 text-muted-foreground ml-auto transition-transform duration-200 group-data-[state=open]:rotate-180" />
                          </div>
                        </SelectTrigger>
                        <SelectContent className="bg-white/98 dark:bg-gray-900/98 backdrop-blur-xl border-primary/30 shadow-2xl rounded-xl overflow-hidden min-w-[300px]">
                          <div className="p-2 bg-gradient-to-r from-primary/5 to-purple-500/5 border-b border-primary/10">
                            <div className="flex items-center gap-2 text-sm font-medium text-primary">
                              <Users className="h-4 w-4" />
                              <span>Available Groups</span>
                              <Badge className="ml-auto bg-primary/10 text-primary text-xs px-2 py-1">
                                {groups.length} total
                              </Badge>
                            </div>
                          </div>
                          {groups.map((group: Group, index: number) => (
                            <SelectItem 
                              key={group.id} 
                              value={group.id}
                              className="hover:bg-gradient-to-r hover:from-primary/10 hover:to-purple-500/10 focus:bg-gradient-to-r focus:from-primary/10 focus:to-purple-500/10 transition-all duration-200 cursor-pointer border-b border-gray-100/50 dark:border-gray-800/50 last:border-b-0 py-3"
                            >
                              <div className="flex items-center gap-3 w-full">
                                <div className="relative">
                                  <div className={`h-3 w-3 rounded-full ${group.id === activeGroupId ? 'bg-gradient-to-r from-green-400 to-emerald-500 animate-pulse' : 'bg-gradient-to-r from-blue-400 to-purple-500'}`} />
                                  {group.id === activeGroupId && (
                                    <div className="absolute -inset-1 bg-green-400 rounded-full animate-ping opacity-30" />
                                  )}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold text-gray-900 dark:text-gray-100">{group.name}</span>
                                    {group.id === activeGroupId && (
                                      <div className="flex items-center gap-1">
                                        <Star className="h-3 w-3 text-amber-500 fill-current" />
                                        <span className="text-xs text-amber-600 font-medium">ACTIVE</span>
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs text-muted-foreground">
                                      {group.members.length} member{group.members.length !== 1 ? 's' : ''}
                                    </span>
                                    <div className="flex -space-x-1">
                                      {group.members.slice(0, 3).map((member, idx) => (
                                        <div key={idx} className="h-4 w-4 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 border border-white dark:border-gray-800 text-[8px] flex items-center justify-center text-white font-bold">
                                          {member.name.charAt(0).toUpperCase()}
                                        </div>
                                      ))}
                                      {group.members.length > 3 && (
                                        <div className="h-4 w-4 rounded-full bg-gray-400 border border-white dark:border-gray-800 text-[8px] flex items-center justify-center text-white font-bold">
                                          +{group.members.length - 3}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                {group.id === activeGroupId && (
                                  <Check className="h-4 w-4 text-green-500" />
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        onClick={() => setIsCreateGroupOpen(true)}
                        className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 px-6 py-3 rounded-lg font-semibold min-h-[3.5rem]"
                      >
                        <div className="flex items-center gap-2">
                          <div className="relative">
                            <Plus className="h-5 w-5" />
                            <div className="absolute -inset-1 bg-white/20 rounded-full animate-ping" />
                          </div>
                          <span>Create New</span>
                        </div>
                      </Button>
                    </div>
                  </div>
                </div>

              {/* Group List */}
              {groups.length > 0 && (
                <div className="space-y-2">
                  <h3>All Groups</h3>
                  <div className="space-y-2">
                    {groups.map((group: Group) => (
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
                                disabled={group.name === 'Just You'}
                              />
                              <Button 
                                size="sm" 
                                onClick={() => handleRenameGroup(group.id)}
                                disabled={group.name === 'Just You'}
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
                          {group.name !== 'Just You' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => startEditingGroup(group)}
                            >
                              <Edit2 className="h-3 w-3" />
                            </Button>
                          )}
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
              )}

              {/* Active Group Members */}
              {activeGroup && (
                <GroupMembersSection
                  activeGroup={activeGroup}
                  onAddMember={() => setIsAddMemberOpen(true)}
                  onRemoveMember={(memberName) => removeGroupMember(activeGroup.id, memberName)}
                />
              )}
            </TabsContent>
            
            <TabsContent value="members" className="space-y-4 mt-4">
              <AllMembersTab
                allMembers={allMembers}
                onOpenChangeGroups={handleOpenChangeGroups}
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

      {/* Add Member Dialog */}
      <AddMemberModal
        isOpen={isAddMemberOpen}
        onClose={() => setIsAddMemberOpen(false)}
        onAddMember={handleAddMember}
      />

      {/* Change Groups Modal */}
      <ChangeGroupsModal
        isOpen={isChangeGroupsOpen}
        onClose={handleCloseChangeGroups}
        selectedMember={selectedMember}
        groups={groups}
        onToggleMemberGroup={handleToggleMemberGroup}
      />
    </div>
  );
};