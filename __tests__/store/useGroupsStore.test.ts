import { useGroupsStore } from '@/store/useGroupsStore';

// Reset the store before each test
beforeEach(() => {
  useGroupsStore.setState({
    groups: [],
    activeGroupId: null,
  });
});

describe('useGroupsStore', () => {
  it('should create a new group', () => {
    const { createGroup } = useGroupsStore.getState();
    
    createGroup('Test Group');
    
    const { groups } = useGroupsStore.getState();
    expect(groups.length).toBe(1);
    expect(groups[0].name).toBe('Test Group');
    expect(groups[0].members).toEqual([]);
    expect(groups[0].cart).toEqual([]);
  });
  
  it('should select a group', () => {
    const { createGroup, selectGroup } = useGroupsStore.getState();
    
    createGroup('Test Group');
    const { groups } = useGroupsStore.getState();
    const groupId = groups[0].id;
    
    selectGroup(groupId);
    
    const { activeGroupId } = useGroupsStore.getState();
    expect(activeGroupId).toBe(groupId);
  });
  
  it('should add a member to a group', () => {
    const { createGroup, addGroupMember } = useGroupsStore.getState();
    
    createGroup('Test Group');
    const { groups } = useGroupsStore.getState();
    const groupId = groups[0].id;
    
    addGroupMember(groupId, { name: 'John', allergens: ['Dairy'] });
    
    const updatedGroups = useGroupsStore.getState().groups;
    expect(updatedGroups[0].members.length).toBe(1);
    expect(updatedGroups[0].members[0].name).toBe('John');
    expect(updatedGroups[0].members[0].allergens).toEqual(['Dairy']);
  });
  
  it('should remove a member from a group', () => {
    const { createGroup, addGroupMember, removeGroupMember } = useGroupsStore.getState();
    
    createGroup('Test Group');
    const { groups } = useGroupsStore.getState();
    const groupId = groups[0].id;
    
    addGroupMember(groupId, { name: 'John', allergens: ['Dairy'] });
    
    removeGroupMember(groupId, 'John');
    
    const finalGroups = useGroupsStore.getState().groups;
    expect(finalGroups[0].members.length).toBe(0);
  });
});