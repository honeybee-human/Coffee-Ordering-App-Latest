// Remove direct imports of other stores
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Group, GroupMember } from '@/types';
import { GroupController } from '@/controllers/GroupController';

interface GroupsStore {
  groups: Group[];
  activeGroupId: string | null;
  allMembers: GroupMember[]; // Add this new state
  
  // Add this
  initialize: () => void;
  
  // Add the missing method
  getActiveGroup: () => Group | null;
  
  // Actions - no longer call other stores directly
  createGroup: (name: string) => void;
  addGroupMember: (groupId: string, member: GroupMember) => void;
  removeGroupMember: (groupId: string, memberName: string) => void; // Remove callback parameter
  selectGroup: (groupId: string) => void;
  deleteGroup: (groupId: string) => void;
  renameGroup: (groupId: string, newName: string) => void;
  
  // Cart actions
  addToCart: (groupId: string, item: CartItem) => void;
  removeFromCart: (groupId: string, itemId: string) => void;
  updateCartQuantity: (groupId: string, itemId: string, quantity: number) => void;
  clearCart: (groupId: string) => void;
  
  // Reset actions
  resetAllData: () => void;
  
  // Add this new action
  toggleFavoriteGroup: (groupId: string) => void;
  
  // Add these new methods for managing allMembers
  addMember: (member: GroupMember) => void;
  removeMember: (memberName: string) => void;
  updateMember: (oldName: string, updatedMember: GroupMember) => void;
  getMemberByName: (name: string) => GroupMember | undefined;
}

export const useGroupsStore = create<GroupsStore>()(persist(
  (set, get) => ({
    groups: [],
    activeGroupId: null,
    allMembers: [], // Initialize empty array

    // Add initialization logic
    initialize: () => {
      const { groups, allMembers } = get();
      if (groups.length === 0) {
        const defaultMember = { name: 'You', allergens: ["Blueberries"] };
        const defaultGroup = {
          id: Date.now().toString(),
          name: 'My First Group',
          members: [defaultMember],
          cart: [],
          dateCreated: new Date()
        };
        set({
          groups: [defaultGroup],
          activeGroupId: defaultGroup.id,
          allMembers: [defaultMember] // Initialize with default member
        });
      }
    },

    getActiveGroup: () => {
      const { groups, activeGroupId } = get();
      return groups.find(group => group.id === activeGroupId) || null;
    },

    createGroup: (name: string) => {
      const newGroup = GroupController.createGroup(name);
      set(state => ({
        groups: [...state.groups, newGroup],
        activeGroupId: newGroup.id
      }));
    },

    addGroupMember: (groupId: string, member: GroupMember) => {
      set(state => {
        // Add to allMembers if not already there
        const memberExists = state.allMembers.some(m => m.name === member.name);
        const newAllMembers = memberExists ? state.allMembers : [...state.allMembers, member];
        
        return {
          groups: state.groups.map(group => 
            group.id === groupId 
              ? GroupController.addMemberToGroup(group, member)
              : group
          ),
          allMembers: newAllMembers
        };
      });
    },

    removeGroupMember: (groupId: string, memberName: string) => {
      set(state => ({
        groups: state.groups.map(group => 
          group.id === groupId 
            ? GroupController.removeMemberFromGroup(group, memberName)
            : group
        )
        // Note: NOT removing from allMembers - member stays in the global list
      }));
    },

    selectGroup: (groupId: string) => {
      set({ activeGroupId: groupId });
    },

    deleteGroup: (groupId: string) => {
      set((state) => {
        const newGroups = state.groups.filter(group => group.id !== groupId);
        const newActiveGroupId = state.activeGroupId === groupId 
          ? (newGroups.length > 0 ? newGroups[0].id : null)
          : state.activeGroupId;
        
        return {
          groups: newGroups,
          activeGroupId: newActiveGroupId
        };
      });
    },

    renameGroup: (groupId: string, newName: string) => {
      set((state) => ({
        groups: state.groups.map(group =>
          group.id === groupId ? { ...group, name: newName } : group
        )
      }));
    },

    // Cart actions
    addToCart: (groupId: string, item: CartItem) => {
      set((state) => ({
        groups: state.groups.map(group =>
          group.id === groupId 
            ? { ...group, cart: [...group.cart, { ...item, id: Date.now().toString() }] }
            : group
        )
      }));
    },

    removeFromCart: (groupId: string, itemId: string) => {
      set((state) => ({
        groups: state.groups.map(group =>
          group.id === groupId 
            ? { ...group, cart: group.cart.filter(item => item.id !== itemId) }
            : group
        )
      }));
    },

    updateCartQuantity: (groupId: string, itemId: string, quantity: number) => {
      if (quantity <= 0) {
        get().removeFromCart(groupId, itemId);
        return;
      }
      
      set((state) => ({
        groups: state.groups.map(group =>
          group.id === groupId 
            ? { 
                ...group, 
                cart: group.cart.map(item =>
                  item.id === itemId ? { ...item, quantity } : item
                )
              }
            : group
        )
      }));
    },

    clearCart: (groupId: string) => {
      set((state) => ({
        groups: state.groups.map(group =>
          group.id === groupId ? { ...group, cart: [] } : group
        )
      }));
    },

    resetAllData: () => {
      const defaultMember = { name: 'You', allergens: ["Blueberries"] };
      const defaultGroup = {
        id: Date.now().toString(),
        name: 'My First Group',
        members: [defaultMember],
        cart: [],
        dateCreated: new Date()
      };
      set({
        groups: [defaultGroup],
        activeGroupId: defaultGroup.id,
        allMembers: [defaultMember] // Reset all members too
      });
    },
    
    // Add this new method
    toggleFavoriteGroup: (groupId: string) => {
      set((state) => ({
        groups: state.groups.map(group =>
          group.id === groupId 
            ? { ...group, isFavorite: !group.isFavorite } 
            : group
        )
      }));
    },

    // Implement the allMembers management methods
    addMember: (member: GroupMember) => {
      set(state => {
        const memberExists = state.allMembers.some(m => m.name === member.name);
        if (memberExists) return state;
        
        return {
          allMembers: [...state.allMembers, member]
        };
      });
    },

    removeMember: (memberName: string) => {
      set(state => ({
        allMembers: state.allMembers.filter(member => member.name !== memberName),
        // Also remove from all groups
        groups: state.groups.map(group => ({
          ...group,
          members: group.members.filter(member => member.name !== memberName)
        }))
      }));
    },

    updateMember: (oldName: string, updatedMember: GroupMember) => {
      set(state => ({
        allMembers: state.allMembers.map(member => 
          member.name === oldName ? updatedMember : member
        ),
        // Also update in all groups
        groups: state.groups.map(group => ({
          ...group,
          members: group.members.map(member =>
            member.name === oldName ? updatedMember : member
          )
        }))
      }));
    },

    getMemberByName: (name: string) => {
      const { allMembers } = get();
      return allMembers.find(member => member.name === name);
    },
  }),
  { name: 'groups-store' }
));

// Custom hooks for convenience
export const useActiveGroup = () => {
  return useGroupsStore(state => state.getActiveGroup());
};

export const useGroups = () => {
  return useGroupsStore(state => state.groups);
};

export const useAllMembers = () => {
  return useGroupsStore(state => state.allMembers);
};

export const useCartCount = () => {
  return useGroupsStore(state => {
    const activeGroup = state.getActiveGroup();
    return activeGroup ? activeGroup.cart.reduce((total, item) => total + item.quantity, 0) : 0;
  });
};

export const useCartSubtotal = () => {
  return useGroupsStore(state => {
    const activeGroup = state.getActiveGroup();
    if (!activeGroup) return 0;
    return activeGroup.cart.reduce((total, item) => {
      const basePrice = item.item.price;
      const customizationPrice = item.customizations ? 
        Object.values(item.customizations).reduce((sum, customization) => {
          return sum + (customization?.price || 0);
        }, 0) : 0;
      return total + ((basePrice + customizationPrice) * item.quantity);
    }, 0);
  });
};

export const useCartTax = () => {
  const subtotal = useCartSubtotal();
  return subtotal * 0.08; // 8% tax rate
};

export const useCartTotal = () => {
  const subtotal = useCartSubtotal();
  const tax = useCartTax();
  return subtotal + tax;
};