import React, { useState, useMemo } from 'react';
import { Button } from '@/ui/button';
import { Card } from '@/ui/card';
import { Crown, Star } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/ui/dialog';
import { Input } from '@/ui/input';
import { Label } from '@/ui/label';
import { GroupMember } from '@/types';
import {
  useGroupsStore,
  useGroups
} from '@/store/useGroupsStore';
import { GroupSearchBar } from '../shared/GroupSearchBar';
import { Group } from '@/types';

const GroupsPage: React.FC = () => {
  const allGroups = useGroups();
  const activeGroupId = useGroupsStore(state => state.activeGroupId);
  const selectGroup = useGroupsStore(state => state.selectGroup);
  const createGroup = useGroupsStore(state => state.createGroup);
  const deleteGroup = useGroupsStore(state => state.deleteGroup);
  const renameGroup = useGroupsStore(state => state.renameGroup);
  const toggleFavoriteGroup = useGroupsStore(state => state.toggleFavoriteGroup);

  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [showEditGroup, setShowEditGroup] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [groupSearchQuery, setGroupSearchQuery] = useState('');

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (newGroupName.trim()) {
      createGroup(newGroupName);
      setNewGroupName('');
      setShowCreateGroup(false);
    }
  };

  const handleEditGroup = (group: Group) => {
    setEditingGroup(group);
    setShowEditGroup(true);
  };

  const handleDeleteGroup = (id: string) => {
    deleteGroup(id);
  };

  const handleUpdateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingGroup && editingGroup.name.trim()) {
      renameGroup(editingGroup.id, editingGroup.name);
      setShowEditGroup(false);
    }
  };

  const sortedGroups = useMemo(() => {
    const filteredGroups = groupSearchQuery.trim()
      ? allGroups.filter(group => 
          group.name.toLowerCase().includes(groupSearchQuery.toLowerCase())
        )
      : allGroups;

    return [...filteredGroups].sort((a, b) => {
      if (a.isFavorite && !b.isFavorite) return -1;
      if (!a.isFavorite && b.isFavorite) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [allGroups, groupSearchQuery]);

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Groups</h1>
        <Button onClick={() => setShowCreateGroup(true)}>
          Create New Group
        </Button>
      </div>

      {allGroups.length === 0 ? (
        <div className="text-center py-8 bg-muted/50 rounded-[1px]">
          <p className="text-muted-foreground mb-4">No groups created yet. Create your first group to start ordering together!</p>
          <p className="text-sm text-muted-foreground">You need to create a group before you can add items to your cart.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <GroupSearchBar 
              searchQuery={groupSearchQuery} 
              onSearchChange={setGroupSearchQuery} 
              placeholder="Search groups..."
            />
            <p className="text-sm text-muted-foreground whitespace-nowrap">
              {sortedGroups.length} of {allGroups.length} groups
            </p>
          </div>
          
          <div className="grid gap-6">
            {sortedGroups.map((group: Group) => (
              <Card key={group.id} className="relative border border-b-2 border-r-2 rounded-[1px] p-8 bg-white">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    {group.id === activeGroupId && (
                      <Crown className="h-4 w-4 text-amber-500" />
                    )}
                    {group.isFavorite && (
                      <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                    )}
                    <div>
                      <h3 className="text-lg font-semibold">{group.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {group.members.length} member{group.members.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => selectGroup(group.id)} // Corrected function
                    >
                      <Crown className="h-5 w-5 md:mr-2" />
                      <span className="hidden md:inline">Select</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleFavoriteGroup(group.id)}
                      className={group.isFavorite ? "text-amber-500" : ""}
                    >
                      <Star className={`h-4 w-4 ${group.isFavorite ? "fill-amber-500" : ""}`} />
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditGroup(group)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteGroup(group.id)}
                      className="text-destructive"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Create Group Dialog */}
      <Dialog open={showCreateGroup} onOpenChange={setShowCreateGroup}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Group</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateGroup} className="space-y-4">
            <div>
              <Label htmlFor="groupName">Group Name</Label>
              <Input
                id="groupName"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="Enter group name"
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateGroup(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Create Group</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Group Dialog */}
      <Dialog open={showEditGroup} onOpenChange={setShowEditGroup}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Group</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateGroup} className="space-y-4">
            <div>
              <Label htmlFor="editGroupName">Group Name</Label>
              <Input
                id="editGroupName"
                value={editingGroup?.name || ''}
                onChange={(e) =>
                  setEditingGroup((prev) =>
                    prev ? { ...prev, name: e.target.value } : null
                  )
                }
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowEditGroup(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GroupsPage;
