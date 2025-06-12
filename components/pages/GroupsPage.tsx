import React, { useState } from 'react';
import { Button } from '@/ui/button';
import { Card } from '@/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/ui/dialog';
import { Input } from '@/ui/input';
import { Label } from '@/ui/label';
import { Group, GroupMember } from '@/types';

interface GroupWithMembers extends Group {
  members: GroupMember[];
}

const GroupsPage: React.FC = () => {
  const [groups, setGroups] = useState<GroupWithMembers[]>([]);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [showEditGroup, setShowEditGroup] = useState(false);
  const [editingGroup, setEditingGroup] = useState<GroupWithMembers | null>(null);

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    // Implementation of handleCreateGroup
  };

  const handleEditGroup = (group: GroupWithMembers) => {
    setEditingGroup(group);
    setShowEditGroup(true);
  };

  const handleDeleteGroup = (id: string) => {
    // Implementation of handleDeleteGroup
  };

  const handleUpdateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    // Implementation of handleUpdateGroup
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Groups</h1>
        <Button onClick={() => setShowCreateGroup(true)}>
          Create New Group
        </Button>
      </div>

      {groups.length === 0 ? (
        <div className="text-center py-8 bg-muted/50 rounded-lg">
          <p className="text-muted-foreground mb-4">No groups created yet. Create your first group to start ordering together!</p>
          <p className="text-sm text-muted-foreground">You need to create a group before you can add items to your cart.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {groups.map((group) => (
            <Card key={group.id} className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">{group.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {group.members.length} member{group.members.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditGroup(group)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteGroup(group.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

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
                disabled={editingGroup?.name === 'Just You'}
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