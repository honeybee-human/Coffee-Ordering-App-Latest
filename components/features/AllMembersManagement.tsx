import React, { useState, useMemo } from 'react';
import { Users, Edit2, Trash2, UserPlus, Check, X } from 'lucide-react';
import { Button } from '@/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { Input } from '@/ui/input';
import { Label } from '@/ui/label';
import { Badge } from '@/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/ui/dialog';
import { Separator } from '@/ui/separator';
import { Group, GroupMember } from '@/types';

interface AllMembersManagementProps {
  groups: Group[];
  onMoveMember: (memberName: string, fromGroupId: string, toGroupId: string) => void;
  onRemoveMember: (groupId: string, memberName: string) => void;
}

interface MemberWithGroup extends GroupMember {
  groupId: string;
  groupName: string;
}

export const AllMembersManagement: React.FC<AllMembersManagementProps> = ({
  groups,
  onMoveMember,
  onRemoveMember
}) => {
  const [editingMember, setEditingMember] = useState<string | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  // Flatten all members with their group information
  const allMembers = useMemo(() => {
    const members: MemberWithGroup[] = [];
    groups.forEach(group => {
      group.members.forEach(member => {
        members.push({
          ...member,
          groupId: group.id,
          groupName: group.name
        });
      });
    });
    return members;
  }, [groups]);

  // Filter members based on search query
  const filteredMembers = useMemo(() => {
    if (!searchQuery.trim()) return allMembers;
    return allMembers.filter(member => 
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.groupName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [allMembers, searchQuery]);

  const handleMoveConfirm = (member: MemberWithGroup) => {
    if (selectedGroupId && selectedGroupId !== member.groupId) {
      onMoveMember(member.name, member.groupId, selectedGroupId);
    }
    setEditingMember(null);
    setSelectedGroupId('');
  };

  const handleEditCancel = () => {
    setEditingMember(null);
    setSelectedGroupId('');
  };

  const startEditing = (member: MemberWithGroup) => {
    setEditingMember(member.name + member.groupId);
    setSelectedGroupId(member.groupId);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          All Members ({allMembers.length})
        </CardTitle>
        <div className="space-y-2">
          <Label htmlFor="member-search">Search Members</Label>
          <Input
            id="member-search"
            placeholder="Search by member name or group..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent>
        {filteredMembers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {searchQuery ? 'No members found matching your search.' : 'No members found. Add members to your groups first.'}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredMembers.map((member) => {
              const memberKey = member.name + member.groupId;
              const isEditing = editingMember === memberKey;
              
              return (
                <div key={memberKey} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{member.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {member.groupName}
                      </Badge>
                    </div>
                    {member.allergens.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {member.allergens.map((allergen) => (
                          <Badge key={allergen} variant="secondary" className="text-xs">
                            {allergen}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {isEditing ? (
                      <>
                        <Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
                          <SelectTrigger className="w-40">
                            <SelectValue placeholder="Select group" />
                          </SelectTrigger>
                          <SelectContent>
                            {groups.map((group) => (
                              <SelectItem key={group.id} value={group.id}>
                                {group.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          size="sm"
                          onClick={() => handleMoveConfirm(member)}
                          disabled={!selectedGroupId || selectedGroupId === member.groupId}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleEditCancel}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => startEditing(member)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => onRemoveMember(member.groupId, member.name)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};