import { Group, GroupMember } from '@/types';
import { generateId } from '@/utils/id-generator';

export class GroupController {
  static createGroup(name: string): Group {
    return {
      id: generateId('group'),
      name,
      members: [],
      cart: [],
      dateCreated: new Date()
    };
  }

  static addMemberToGroup(group: Group, member: GroupMember): Group {
    if (group.members.some(m => m.name === member.name)) {
      return group; // Member already exists
    }
    return {
      ...group,
      members: [...group.members, member]
    };
  }

  static removeMemberFromGroup(group: Group, memberName: string): Group {
    return {
      ...group,
      members: group.members.filter(m => m.name !== memberName)
    };
  }

  static isMemberInGroup(group: Group, memberName: string): boolean {
    return group.members.some(m => m.name === memberName);
  }
}