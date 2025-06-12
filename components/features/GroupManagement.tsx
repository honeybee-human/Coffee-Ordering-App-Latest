import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Users, Plus, Trash2, Edit2, UserPlus, X, Check, AlertTriangle, ChevronDown } from 'lucide-react';
import { Button } from '@/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { Input } from '@/ui/input';
import { Label } from '@/ui/label';
import { Badge } from '@/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/ui/dialog';
import { Separator } from '@/ui/separator';
import { Group, GroupMember } from '@/types';
import { COMMON_ALLERGENS, normalizeAllergens } from '@/utils/allergens';

interface GroupManagementProps {
  groups: Group[];
  activeGroupId: string | null;
  onCreateGroup: (name: string) => void;
  onSelectGroup: (groupId: string) => void;
  onDeleteGroup: (groupId: string) => void;
  onRenameGroup: (groupId: string, newName: string) => void;
  onAddMember: (groupId: string, member: GroupMember) => void;
  onRemoveMember: (groupId: string, memberName: string) => void;
}

export const GroupManagement: React.FC<GroupManagementProps> = ({
  groups,
  activeGroupId,
  onCreateGroup,
  onSelectGroup,
  onDeleteGroup,
  onRenameGroup,
  onAddMember,
  onRemoveMember
}) => {
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [newGroupName, setNewGroupName] = useState('');
  const [editGroupName, setEditGroupName] = useState('');
  const [newMember, setNewMember] = useState<{ name: string; allergens: string[] }>({ 
    name: '', 
    allergens: [] 
  });
  const [newAllergen, setNewAllergen] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const activeGroup = groups.find(g => g.id === activeGroupId);

  // Filter suggestions based on prefix matching
  const suggestions = useMemo(() => {
    const searchTerm = newAllergen.toLowerCase().trim();
    if (!searchTerm) return [];
    
    return COMMON_ALLERGENS
      .filter(allergen => 
        !newMember.allergens.includes(allergen) &&
        allergen.toLowerCase().startsWith(searchTerm)
      )
      .slice(0, 8);
  }, [newAllergen, newMember.allergens]);

  const resetNewMemberForm = useCallback(() => {
    setNewMember({ name: '', allergens: [] });
    setNewAllergen('');
    setShowSuggestions(false);
    setSelectedIndex(-1);
  }, []);

  const handleCreateGroup = useCallback(() => {
    if (newGroupName.trim()) {
      onCreateGroup(newGroupName.trim());
      setNewGroupName('');
      setIsCreateGroupOpen(false);
    }
  }, [newGroupName, onCreateGroup]);

  const handleRenameGroup = useCallback((groupId: string) => {
    if (editGroupName.trim()) {
      onRenameGroup(groupId, editGroupName.trim());
      setEditingGroupId(null);
      setEditGroupName('');
    }
  }, [editGroupName, onRenameGroup]);

  const handleAddMember = useCallback(() => {
    if (newMember.name.trim() && activeGroupId) {
      const memberToAdd: GroupMember = {
        name: newMember.name.trim(),
        allergens: normalizeAllergens(newMember.allergens)
      };
      
      onAddMember(activeGroupId, memberToAdd);
      resetNewMemberForm();
      setIsAddMemberOpen(false);
    }
  }, [newMember, activeGroupId, onAddMember, resetNewMemberForm]);

  const handleAddAllergen = useCallback((allergen?: string) => {
    const allergenToAdd = allergen || newAllergen.trim();
    if (allergenToAdd) {
      const normalizedAllergen = normalizeAllergens([allergenToAdd])[0];
      if (normalizedAllergen && !newMember.allergens.includes(normalizedAllergen)) {
        setNewMember(prev => ({
          ...prev,
          allergens: [...prev.allergens, normalizedAllergen]
        }));
        setNewAllergen('');
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    }
  }, [newAllergen, newMember.allergens]);

  const handleRemoveAllergen = useCallback((allergen: string) => {
    setNewMember(prev => ({
      ...prev,
      allergens: prev.allergens.filter(a => a !== allergen)
    }));
  }, []);

  const startEditingGroup = useCallback((group: Group) => {
    setEditingGroupId(group.id);
    setEditGroupName(group.name);
  }, []);

  const cancelEditing = useCallback(() => {
    setEditingGroupId(null);
    setEditGroupName('');
  }, []);

  const handleCloseAddMemberDialog = useCallback(() => {
    resetNewMemberForm();
    setIsAddMemberOpen(false);
  }, [resetNewMemberForm]);

  const handleCloseCreateGroupDialog = useCallback(() => {
    setNewGroupName('');
    setIsCreateGroupOpen(false);
  }, []);

  // Autocomplete handlers
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewAllergen(value);
    setSelectedIndex(-1);
    setShowSuggestions(value.trim().length > 0);
  }, []);

  const handleInputKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleAddAllergen();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleAddAllergen(suggestions[selectedIndex]);
        } else {
          handleAddAllergen();
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  }, [showSuggestions, suggestions, selectedIndex, handleAddAllergen]);

  const handleSuggestionClick = useCallback((suggestion: string) => {
    handleAddAllergen(suggestion);
  }, [handleAddAllergen]);

  const handleInputFocus = useCallback(() => {
    if (newAllergen.trim().length > 0) {
      setShowSuggestions(true);
    }
  }, [newAllergen]);

  const handleInputBlur = useCallback(() => {
    // Delay hiding suggestions to allow clicking
    setTimeout(() => {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }, 200);
  }, []);

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current && 
        suggestionsRef.current &&
        !inputRef.current.contains(event.target as Node) &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            <span className="text-lg font-bold">Group Management</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Group Selection */}
          <div className="space-y-2">
            <h3>Active Group</h3>
            <div className="flex gap-2">
              <Select 
                value={activeGroupId || ''} 
                onValueChange={onSelectGroup}
              >
                <SelectTrigger className="flex-1 bg-muted">
                  <SelectValue placeholder="Select a group or create new one" />
                </SelectTrigger>
                <SelectContent>
                  {groups.map(group => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.name} ({group.members.length} member{group.members.length !== 1 ? 's' : ''})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                variant="outline" 
                onClick={() => setIsCreateGroupOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                New Group
              </Button>
            </div>
          </div>

          {/* Group List */}
          {groups.length > 0 && (
            <div className="space-y-2">
              <h3>All Groups</h3>
              <div className="space-y-2">
                {groups.map(group => (
                  <div 
                    key={group.id} 
                    className={`flex items-center justify-between p-3 ${
                      group.id === activeGroupId ? 'bg-primary/5 ' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2 flex-1">
                      {editingGroupId === group.id ? (
                        <div className="flex items-center gap-2 flex-1">
                          <Input
                            value={editGroupName}
                            onChange={(e) => setEditGroupName(e.target.value)}
                            onKeyDown={(e) => {
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
                          <Badge variant="secondary" className="text-xs">
                            {group.members.length} member{group.members.length !== 1 ? 's' : ''}
                          </Badge>
                          {group.cart.length > 0 && (
                            <Badge variant="outline" className="text-xs">
                              {group.cart.length} item{group.cart.length !== 1 ? 's' : ''} in cart
                            </Badge>
                          )}
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => startEditingGroup(group)}
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onDeleteGroup(group.id)}
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
                    onClick={() => setIsAddMemberOpen(true)}
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
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Create Group Dialog */}
      <Dialog open={isCreateGroupOpen} onOpenChange={setIsCreateGroupOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Group</DialogTitle>
            <DialogDescription>
              Create a new group to organize orders and manage member allergies.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="group-name">Group Name</Label>
              <Input
                id="group-name"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="Enter group name"
                onKeyDown={(e) => e.key === 'Enter' && handleCreateGroup()}
              />
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={handleCloseCreateGroupDialog}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCreateGroup}
                className="flex-1"
                disabled={!newGroupName.trim()}
              >
                Create Group
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Member Dialog */}
      <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Group Member</DialogTitle>
            <DialogDescription>
              Add a new member to the group and specify any allergies they may have.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="member-name">Name</Label>
              <Input
                id="member-name"
                value={newMember.name}
                onChange={(e) => setNewMember(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter member name"
                disabled={activeGroup && activeGroup.name === 'Just You'}
              />
            </div>
            
            <div className="space-y-3">
              <Label>Allergens (optional)</Label>
              
              {/* Simple Autocomplete */}
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Input
                    ref={inputRef}
                    value={newAllergen}
                    onChange={handleInputChange}
                    onKeyDown={handleInputKeyDown}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                    placeholder="Type allergen name (e.g., Milk, Nuts)"
                    autoComplete="off"
                  />
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  
                  {/* Suggestions Dropdown */}
                  {showSuggestions && suggestions.length > 0 && (
                    <div 
                      ref={suggestionsRef}
                      className="absolute top-full left-0 right-0 mt-1 bg-white border border-border rounded-md shadow-lg z-50 max-h-60 overflow-y-auto"
                    >
                      {suggestions.map((suggestion, index) => (
                        <div
                          key={suggestion}
                          className={`px-3 py-2 cursor-pointer transition-colors border-b border-border/30 last:border-b-0 ${
                            index === selectedIndex 
                              ? 'bg-accent/10 text-accent-foreground' 
                              : 'hover:bg-muted/50'
                          }`}
                          onClick={() => handleSuggestionClick(suggestion)}
                        >
                          <span className="text-sm">{suggestion}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <Button 
                  type="button" 
                  onClick={() => handleAddAllergen()}
                  disabled={!newAllergen.trim()}
                  variant="destructive"
                  size="sm"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Added Allergens Display */}
              {newMember.allergens.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Added allergens:</p>
                  <div className="flex flex-wrap gap-2">
                    {newMember.allergens.map((allergen, index) => (
                      <Badge 
                        key={`${allergen}-${index}`} 
                        variant="destructive"
                        className="cursor-pointer hover:opacity-80 flex items-center gap-1"
                        onClick={() => handleRemoveAllergen(allergen)}
                      >
                        <AlertTriangle className="h-3 w-3" />
                        {allergen}
                        <X className="h-3 w-3 ml-1" />
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">Click on an allergen to remove it</p>
                </div>
              )}

              {/* Helpful Text */}
              <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-md">
                <p className="font-medium mb-1">💡 Tip:</p>
                <p>Type to search allergens starting with your input. Use arrow keys to navigate suggestions, Enter to select, or type custom allergens and press Enter to add them.</p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={handleCloseAddMemberDialog}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleAddMember}
                disabled={!newMember.name.trim() || (activeGroup && activeGroup.name === 'Just You')}
                className="flex-1"
              >
                Add Member
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};