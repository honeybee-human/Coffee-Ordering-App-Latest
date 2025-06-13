import { create } from 'zustand';
import { persist, createJSONStorage, PersistOptions } from 'zustand/middleware';
import type { StateCreator } from 'zustand';
import { Group, CartItem, GroupMember } from '@/types';
import { calculateCartTotal, calculateCartSubtotal, calculateTax } from '@/utils/cart-calculations';

export interface GroupsStore {
  groups: Group[];
  activeGroupId: string | null;
  
  // Computed getters
  getActiveGroup: () => Group | undefined;
  getCartCount: () => number;
  getCartSubtotal: () => number;
  getCartTax: (taxRate?: number) => number;
  getCartTotal: (taxRate?: number) => { subtotal: number; tax: number; total: number; };
  
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
  
  // Reset actions
  resetAllData: () => void;
}

type GroupsPersist = {
  groups: Group[];
  activeGroupId: string | null;
};

const storeImplementation: StateCreator<
  GroupsStore,
  [['zustand/persist', unknown]],
  [],
  GroupsStore
> = (set, get) => ({
  groups: [],
  activeGroupId: null,

  // Computed getters
  getActiveGroup: () => {
    const { groups, activeGroupId } = get();
    return groups.find(group => group.id === activeGroupId);
  },

  getCartCount: () => {
    const activeGroup = get().getActiveGroup();
    return activeGroup?.cart.reduce((sum, item) => sum + item.quantity, 0) || 0;
  },
  
  getCartSubtotal: () => {
    const activeGroup = get().getActiveGroup();
    return activeGroup ? calculateCartSubtotal(activeGroup.cart) : 0;
  },
  
  getCartTax: (taxRate = 0.08) => {
    const subtotal = get().getCartSubtotal();
    return calculateTax(subtotal, taxRate);
  },
  
  getCartTotal: (taxRate = 0.08) => {
    const activeGroup = get().getActiveGroup();
    return activeGroup ? calculateCartTotal(activeGroup.cart, taxRate) : { subtotal: 0, tax: 0, total: 0 };
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
  }
});

export const useGroupsStore = create<GroupsStore>()(  
  persist(
    (set, get, ...a) => {
      const initialState = storeImplementation(set, get, ...a);
      if (initialState.groups.length === 0) {
        const defaultGroup = {
          id: Date.now().toString(),
          name: 'Just You',
          members: [{ name: 'You', allergens: [] }],
          cart: [],
          dateCreated: new Date()
        };
        initialState.groups = [defaultGroup];
        initialState.activeGroupId = defaultGroup.id;
      }
      return initialState;
    },
    {
      name: 'bean-bite-groups',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        groups: state.groups,
        activeGroupId: state.activeGroupId
      }),
      serialize: (state) => JSON.stringify(state, (key, value) => {
        if (value instanceof Date) {
          return { __type: 'Date', value: value.toISOString() };
        }
        return value;
      }),
      deserialize: (str) => JSON.parse(str, (key, value) => {
        if (value && typeof value === 'object' && value.__type === 'Date') {
          return new Date(value.value);
        }
        return value;
      })
    } as PersistOptions<GroupsStore, GroupsPersist>
  )
);

// Selector hooks
export const useActiveGroup = () => useGroupsStore(state => state.getActiveGroup());
export const useCartCount = () => useGroupsStore(state => state.getCartCount());
export const useGroups = () => useGroupsStore(state => state.groups);
export const useCartSubtotal = () => useGroupsStore(state => state.getCartSubtotal());
export const useCartTax = (taxRate?: number) => useGroupsStore(state => state.getCartTax(taxRate));
export const useCartTotal = (taxRate?: number) => useGroupsStore(state => state.getCartTotal(taxRate));