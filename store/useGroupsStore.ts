// Remove direct imports of other stores
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Group, GroupMember } from '@/types';
import { GroupController } from '@/controllers/GroupController';

interface GroupsStore {
  groups: Group[];
  activeGroupId: string | null;
  
  // Add this
  initialize: () => void;
  
  // Add the missing method
  getActiveGroup: () => Group | null;
  
  // Actions - no longer call other stores directly
  createGroup: (name: string) => void;
  addGroupMember: (groupId: string, member: GroupMember) => void;
  removeGroupMember: (groupId: string, memberName: string, onMemberRemoved?: (memberName: string, groupId: string) => void) => void;
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
}

export const useGroupsStore = create<GroupsStore>()(persist(
  (set, get) => ({
    groups: [],
    activeGroupId: null,

    // Add initialization logic
    initialize: () => {
      const { groups } = get();
      if (groups.length === 0) {
        const defaultGroup = {
          id: Date.now().toString(),
          name: 'Just You',
          members: [{ name: 'You', allergens: [] }],
          cart: [],
          dateCreated: new Date()
        };
        set({
          groups: [defaultGroup],
          activeGroupId: defaultGroup.id
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
      set(state => ({
        groups: state.groups.map(group => 
          group.id === groupId 
            ? GroupController.addMemberToGroup(group, member)
            : group
        )
      }));
    },

    removeGroupMember: (groupId: string, memberName: string, onMemberRemoved?: (memberName: string, groupId: string) => void) => {
      set(state => ({
        groups: state.groups.map(group => 
          group.id === groupId 
            ? GroupController.removeMemberFromGroup(group, memberName)
            : group
        )
      }));
      
      // Call the callback to handle cleanup in other stores
      onMemberRemoved?.(memberName, groupId);
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
      const defaultGroup = {
        id: Date.now().toString(),
        name: 'Just You',
        members: [{ name: 'You', allergens: [] }],
        cart: [],
        dateCreated: new Date()
      };
      set({
        groups: [defaultGroup],
        activeGroupId: defaultGroup.id
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