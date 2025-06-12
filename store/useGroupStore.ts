import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Group, GroupMember, CartItem } from '@/types';

interface GroupState {
  // State
  groups: Group[];
  activeGroupId: string | null;
  
  // Computed getters
  getActiveGroup: () => Group | undefined;
  
  // Group actions
  createGroup: (name: string) => void;
  selectGroup: (groupId: string) => void;
  deleteGroup: (groupId: string) => void;
  renameGroup: (groupId: string, newName: string) => void;
  addGroupMember: (groupId: string, member: GroupMember) => void;
  removeGroupMember: (groupId: string, memberName: string) => void;
  
  // Cart actions
  addToCart: (groupId: string, item: CartItem) => void;
  removeFromCart: (groupId: string, itemId: string) => void;
  updateCartQuantity: (groupId: string, itemId: string, quantity: number) => void;
  clearCart: (groupId: string) => void;
}

interface GroupPersist {
  groups: Group[];
  activeGroupId: string | null;
}

export const useGroupStore = create<GroupState>()(
  persist(
    (set, get) => ({
      // Initial state
      groups: [],
      activeGroupId: null,

      // Computed getters
      getActiveGroup: () => {
        const { groups, activeGroupId } = get();
        return groups.find(group => group.id === activeGroupId);
      },

      // Group actions
      createGroup: (name: string) => {
        const newGroup: Group = {
          id: Date.now().toString(),
          name,
          members: [],
          cart: [],
          dateCreated: new Date()
        };
        
        set((state) => ({
          groups: [...state.groups, newGroup],
          activeGroupId: newGroup.id
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

      addGroupMember: (groupId: string, member: GroupMember) => {
        set((state) => ({
          groups: state.groups.map(group =>
            group.id === groupId 
              ? { ...group, members: [...group.members, member] }
              : group
          )
        }));
      },

      removeGroupMember: (groupId: string, memberName: string) => {
        set((state) => ({
          groups: state.groups.map(group =>
            group.id === groupId 
              ? { ...group, members: group.members.filter(m => m.name !== memberName) }
              : group
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
    }),
    {
      name: 'bean-bite-groups',
      partialize: (state) => ({
        groups: state.groups,
        activeGroupId: state.activeGroupId,
      }),
    }
  )
);

// Selector hooks for better performance
export const useActiveGroup = () => useGroupStore(state => state.getActiveGroup());
export const useGroups = () => useGroupStore(state => state.groups);