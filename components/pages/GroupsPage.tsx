import React, { useState } from 'react';
import { Button } from '@/ui/button';
import { Card } from '@/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/ui/dialog';
import { Input } from '@/ui/input';
import { Label } from '@/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/ui/tabs';
import { Group, GroupMember } from '@/types';
import { GroupManagement } from '@/components/features/GroupManagement';
import { AllMembersManagement } from '@/components/features/AllMembersManagement';
import { useGroupStore } from '@/store/useGroupStore';
import { useBusinessLogic } from '@/store/useBusinessLogic';

const GroupsPage: React.FC = () => {
  // Get groups and actions from stores
  const { groups, activeGroupId } = useGroupStore();
  const {
    createGroup,
    selectGroup,
    deleteGroup,
    renameGroup,
    addGroupMember,
    removeGroupMember
  } = useBusinessLogic();

  const handleMoveMember = (memberName: string, fromGroupId: string, toGroupId: string) => {
    const fromGroup = groups.find(g => g.id === fromGroupId);
    const member = fromGroup?.members.find(m => m.name === memberName);
    
    if (member) {
      // Remove from old group
      removeGroupMember(fromGroupId, memberName);
      // Add to new group
      addGroupMember(toGroupId, member);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Groups Management</h1>
      </div>

      <Tabs defaultValue="groups" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="groups">Group Management</TabsTrigger>
          <TabsTrigger value="members">All Members</TabsTrigger>
        </TabsList>
        
        <TabsContent value="groups" className="space-y-4">
          <GroupManagement
            groups={groups}
            activeGroupId={activeGroupId}
            onCreateGroup={createGroup}
            onSelectGroup={selectGroup}
            onDeleteGroup={deleteGroup}
            onRenameGroup={renameGroup}
            onAddMember={addGroupMember}
            onRemoveMember={removeGroupMember}
          />
        </TabsContent>
        
        <TabsContent value="members" className="space-y-4">
          <AllMembersManagement
            groups={groups}
            onMoveMember={handleMoveMember}
            onRemoveMember={removeGroupMember}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GroupsPage;